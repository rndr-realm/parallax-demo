"use client";
import React, { useEffect, useRef } from "react";
import { DomPlane } from "@/src/components/dom/card";
import {
  boxPosition,
  createDragValues,
  createMousePositionValues,
  createScrollValues,
  FLICK_STRENGTH,
  FLICK_TIMEOUT,
  MOUSE_EASE,
  originalSize,
  VELOCITY_EASE,
} from "@/src/lib/static";
import { clamp } from "@/src/lib/helper";

type IDomPlane = {
  element: HTMLElement;
  rect: { x: number; y: number; width: number; height: number };
  extraX: number;
  extraY: number;
  ease: number;
};

const MAX_SHIFT = 11.538;

export default function Page() {
  const planeRefs = useRef<IDomPlane[]>([]);
  const scaleFactor = useRef(0);
  const tileSize = useRef({ h: originalSize.h, w: originalSize.w });
  const scrollRef = useRef(createScrollValues());
  const mousePosition = useRef(createMousePositionValues());
  const previousTimeElapsedRef = useRef(0);
  const dragRef = useRef(createDragValues());

  useEffect(() => {
    let raf: number;
    function handleResize() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      scaleFactor.current = Math.max(
        screenWidth / originalSize.w,
        screenHeight / originalSize.h,
      );

      scaleFactor.current = Math.max(scaleFactor.current, 0.75);

      tileSize.current = {
        h: originalSize.h * scaleFactor.current,
        w: originalSize.w * scaleFactor.current,
      };

      for (let i = 0; i < planeRefs.current.length; i++) {
        const item = planeRefs.current[i];

        const currentPlane = boxPosition[i % boxPosition.length];

        const group = Math.floor(i / boxPosition.length);
        const col = group % 2;
        const row = Math.floor(group / 2);

        const left =
          currentPlane.x * scaleFactor.current + col * tileSize.current.w;
        const top =
          currentPlane.y * scaleFactor.current + row * tileSize.current.h;
        const width = currentPlane.w * scaleFactor.current;
        const height = currentPlane.h * scaleFactor.current;

        item.rect = { x: left, y: top, width, height };
        item.extraX = 0;
        item.extraY = 0;
        item.ease = Math.random() + 1;

        item.element.style.left = `${left}px`;
        item.element.style.top = `${top}px`;
        item.element.style.width = `${width}px`;
        item.element.style.height = `${height}px`;
        // item.element.style.background = currentPlane.color;
        // item.element.style.background = "red";
      }
    }

    function handlePointerDown(e: PointerEvent) {
      const drag = dragRef.current;
      if (drag.pointerId !== null) return;

      e.preventDefault();

      drag.pointerId = e.pointerId;
      drag.time = e.timeStamp;

      drag.x.start = drag.x.last = e.clientX;
      drag.y.start = drag.y.last = e.clientY;
      drag.x.scroll = scrollRef.current.target.x;
      drag.y.scroll = scrollRef.current.target.y;
      drag.x.velocity = 0;
      drag.y.velocity = 0;
    }

    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;

      // a touch has no hover, so it would teleport the cursor parallax on every tap
      if (e.pointerType !== "touch") {
        mousePosition.current.x.target = e.clientX / window.innerWidth;
        mousePosition.current.y.target = e.clientY / window.innerHeight;
      }

      if (drag.pointerId !== e.pointerId) return;

      const elapsed = e.timeStamp - drag.time;
      if (elapsed > 0) {
        const velocityX = (e.clientX - drag.x.last) / elapsed;
        const velocityY = (e.clientY - drag.y.last) / elapsed;

        drag.x.velocity += (velocityX - drag.x.velocity) * VELOCITY_EASE;
        drag.y.velocity += (velocityY - drag.y.velocity) * VELOCITY_EASE;

        drag.time = e.timeStamp;
        drag.x.last = e.clientX;
        drag.y.last = e.clientY;
      }

      scrollRef.current.target.x = drag.x.scroll + (e.clientX - drag.x.start);
      scrollRef.current.target.y = drag.y.scroll + (e.clientY - drag.y.start);
    }

    // pointercancel fires instead of pointerup whenever the browser or the OS
    // claims the gesture, so both have to release the drag
    function handlePointerUp(e: PointerEvent) {
      const drag = dragRef.current;
      if (drag.pointerId !== e.pointerId) return;

      drag.pointerId = null;

      if (e.type === "pointercancel") return;
      if (e.timeStamp - drag.time > FLICK_TIMEOUT) return;

      scrollRef.current.target.x += drag.x.velocity * FLICK_STRENGTH;
      scrollRef.current.target.y += drag.y.velocity * FLICK_STRENGTH;
    }

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = 0.4;

      scrollRef.current.target.x -= e.deltaX * factor;
      scrollRef.current.target.y -= e.deltaY * factor;
    }

    function tick(t: number) {
      // const delta = t - previousTimeElapsedRef.current;
      previousTimeElapsedRef.current = t;

      const scroll = scrollRef.current;
      const mouse = mousePosition.current;

      scroll.current.x += (scroll.target.x - scroll.current.x) * scroll.ease;
      scroll.current.y += (scroll.target.y - scroll.current.y) * scroll.ease;

      scroll.delta.x.target = scroll.current.x - scroll.last.x;
      scroll.delta.y.target = scroll.current.y - scroll.last.y;
      scroll.delta.x.current +=
        (scroll.delta.x.target - scroll.delta.x.current) * MOUSE_EASE;
      scroll.delta.y.current +=
        (scroll.delta.y.target - scroll.delta.y.current) * MOUSE_EASE;

      mouse.x.current += (mouse.x.target - mouse.x.current) * MOUSE_EASE;
      mouse.y.current += (mouse.y.target - mouse.y.current) * MOUSE_EASE;

      const dirX = scroll.current.x > scroll.last.x ? "right" : "left";
      const dirY = scroll.current.y > scroll.last.y ? "down" : "up";

      const spanX = tileSize.current.w * 2;
      const spanY = tileSize.current.h * 2;

      for (let i = 0; i < planeRefs.current.length; i++) {
        const item = planeRefs.current[i];

        const parallaxX =
          (-(mouse.x.current - 0.5) * item.rect.width * 0.5 -
            8 * scroll.delta.x.current * item.ease) *
          1;
        const parallaxY =
          (-(mouse.y.current - 0.5) * item.rect.height * 0.5 -
            8 * scroll.delta.y.current * item.ease) *
          1;

        const errorSpaceX = item.rect.width * 0.5;
        const errorSpaceY = item.rect.height * 0.5;

        const posX = item.rect.x + scroll.current.x + item.extraX + parallaxX;
        const posY = item.rect.y + scroll.current.y + item.extraY + parallaxY;

        const beforeX = posX > window.innerWidth + errorSpaceX;
        const afterX = posX + item.rect.width < 0 - errorSpaceX;
        if (dirX === "right" && beforeX) item.extraX -= spanX;
        if (dirX === "left" && afterX) item.extraX += spanX;

        const beforeY = posY > window.innerHeight + errorSpaceY;
        const afterY = posY + item.rect.height < 0 - errorSpaceY;
        if (dirY === "down" && beforeY) item.extraY -= spanY;
        if (dirY === "up" && afterY) item.extraY += spanY;

        const newPosX = scroll.current.x + item.extraX + parallaxX;
        const newPosY = scroll.current.y + item.extraY + parallaxY;

        const centeredX = newPosX + item.rect.x + item.rect.width * 0.5;
        const centeredY = newPosY + item.rect.y + item.rect.height * 0.5;

        const viewportCenterX = window.innerWidth * 0.5;
        const viewportCenterY = window.innerHeight * 0.5;

        const tx = (centeredX - viewportCenterX) / viewportCenterX;
        const ty = (centeredY - viewportCenterY) / viewportCenterY;

        const clampedX = clamp(-1, 1, tx);
        const clampedY = clamp(-1, 1, ty);

        const shiftX = -clampedX * MAX_SHIFT;
        const shiftY = -clampedY * MAX_SHIFT;

        const img = item.element.querySelector<HTMLElement>("[data-box]");

        item.element.style.transform = `translate(${newPosX}px, ${newPosY}px)`;
        if (img) {
          img.style.transform = `translate3d(${shiftX}%, ${shiftY}%, 0)`;
        }
        // item.element.style.transform = `translateX(${fx}px)`;
      }

      scroll.last.x = scroll.current.x;
      scroll.last.y = scroll.current.y;

      raf = requestAnimationFrame(tick);
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("wheel", handleWheel);

      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="w-full h-dvh overflow-hidden relative touch-none select-none overscroll-none bg-white">
      {Array(boxPosition.length * 4)
        .fill(0)
        .map((_, index) => {
          return (
            <DomPlane
              key={index}
              ref={(el) => {
                if (!el) return;
                const existing = planeRefs.current[index];
                if (existing) {
                  existing.element = el;
                  return;
                }
                planeRefs.current[index] = {
                  element: el,
                  rect: { x: 0, y: 0, width: 0, height: 0 },
                  extraX: 0,
                  extraY: 0,
                  ease: 0,
                };
              }}
              index={index}
            />
          );
        })}
    </div>
  );
}
