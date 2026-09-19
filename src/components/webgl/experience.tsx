import React, { Fragment, useEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { easing } from "maath";
import {
  boxPosition,
  createDragValues,
  createMousePositionValues,
  createScrollValues,
  FLICK_STRENGTH,
  FLICK_TIMEOUT,
  IMAGES,
  MOUSE_EASE,
  originalSize,
  VELOCITY_EASE,
} from "@/src/lib/static";
import { BufferGeometry, MathUtils, Mesh, PlaneGeometry, Scene } from "three";
import type { CardMaterialImpl } from "../../materials/card-material";
import type { InfiniteScreenMaterialImpl } from "../../materials/infinite-material";
import { WebglPlane } from "./plane";
import { rectToWebgl } from "@/src/lib/helper";

import "../../materials/infinite-material";

type MeshPlane = {
  mesh: Mesh<BufferGeometry, CardMaterialImpl>;
  extraX: number;
  extraY: number;
  ease: number;
  rect: { x: number; y: number; width: number; height: number };
};

export function Experience() {
  const { height, width, dpr } = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);

  const planeRefs = useRef<MeshPlane[]>([]);
  const scaleFactor = useRef(0);
  const tileSize = useRef({ h: originalSize.h, w: originalSize.w });
  const scrollRef = useRef(createScrollValues());
  const mousePosition = useRef(createMousePositionValues());
  const dragRef = useRef(createDragValues());
  const screenMaterialRef = useRef<InfiniteScreenMaterialImpl>(null);

  const geometry = useMemo(() => {
    return new PlaneGeometry(1, 1, 64, 64);
  }, []);

  const sourceScene = useMemo(() => new Scene(), []);

  const sourceRenderTarget = useFBO(
    size.width * MathUtils.clamp(dpr, 1, 2),
    size.height * MathUtils.clamp(dpr, 1, 2),
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    scaleFactor.current = Math.max(
      width / originalSize.w,
      height / originalSize.h,
      0.75,
    );

    tileSize.current = {
      h: originalSize.h * scaleFactor.current,
      w: originalSize.w * scaleFactor.current,
    };
    // console.log("i am resizing");

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
      const domWidth = currentPlane.w * scaleFactor.current;
      const domHeight = currentPlane.h * scaleFactor.current;

      const pos = rectToWebgl(
        { height: domHeight, left, top, width: domWidth },
        { height, width },
      );

      item.extraX = 0;
      item.extraY = 0;
      item.ease = Math.random() + 1;
      item.rect = pos;

      item.mesh.position.set(pos.x, pos.y, 0);
      item.mesh.scale.set(pos.width, pos.height, 1);
    }
  }, [width, height]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const drag = dragRef.current;
      if (drag.pointerId !== null) return;

      e.preventDefault();

      drag.pointerId = e.pointerId;
      drag.time = e.timeStamp;

      drag.x.start = drag.x.last = e.clientX;
      drag.y.start = drag.y.last = -e.clientY;
      drag.x.scroll = scrollRef.current.target.x;
      drag.y.scroll = scrollRef.current.target.y;
      drag.x.velocity = 0;
      drag.y.velocity = 0;
    }

    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;

      // a touch has no hover, and a dragging pointer is steering the grid, so
      // neither should feed the cursor parallax
      if (e.pointerType !== "touch" && drag.pointerId === null) {
        mousePosition.current.x.target = e.clientX / window.innerWidth;
        mousePosition.current.y.target = e.clientY / window.innerHeight;
      }

      if (drag.pointerId !== e.pointerId) return;

      const elapsed = e.timeStamp - drag.time;
      if (elapsed > 0) {
        const velocityX = (e.clientX - drag.x.last) / elapsed;
        const velocityY = (-e.clientY - drag.y.last) / elapsed;

        drag.x.velocity += (velocityX - drag.x.velocity) * VELOCITY_EASE;
        drag.y.velocity += (velocityY - drag.y.velocity) * VELOCITY_EASE;

        drag.time = e.timeStamp;
        drag.x.last = e.clientX;
        drag.y.last = -e.clientY;
      }

      scrollRef.current.target.x = drag.x.scroll + (e.clientX - drag.x.start);
      scrollRef.current.target.y = drag.y.scroll + (-e.clientY - drag.y.start);
    }

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

      const factor = 0.7;

      scrollRef.current.target.x -= e.deltaX * factor;
      // webgl y grows upwards, so this is the one axis whose sign flips
      scrollRef.current.target.y += e.deltaY * factor;
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useFrame((state, delta) => {
    const { viewport, gl, camera } = state;

    const scroll = scrollRef.current;
    const mouse = mousePosition.current;

    const scrollEase = scroll.ease;
    const mouseEase = MOUSE_EASE;
    const scrolLDeltaEase = MOUSE_EASE;

    scroll.current.x += (scroll.target.x - scroll.current.x) * scrollEase;
    scroll.current.y += (scroll.target.y - scroll.current.y) * scrollEase;

    scroll.delta.x.target = scroll.current.x - scroll.last.x;
    scroll.delta.y.target = scroll.current.y - scroll.last.y;
    scroll.delta.x.current +=
      (scroll.delta.x.target - scroll.delta.x.current) * scrolLDeltaEase;
    scroll.delta.y.current +=
      (scroll.delta.y.target - scroll.delta.y.current) * scrolLDeltaEase;

    mouse.x.current += (mouse.x.target - mouse.x.current) * mouseEase;
    mouse.y.current += (mouse.y.target - mouse.y.current) * mouseEase;

    const dirX = scroll.current.x > scroll.last.x ? "right" : "left";
    const dirY = scroll.current.y > scroll.last.y ? "up" : "down";

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

      const posX = item.rect.x + scroll.current.x + item.extraX + parallaxX;
      const posY = item.rect.y + scroll.current.y + item.extraY + parallaxY;

      // a plane is positioned by its centre, so the edge tests need its half size
      const halfW = item.mesh.scale.x * 0.5 + item.rect.width * 0.5;
      const halfH = item.mesh.scale.y * 0.5 + item.rect.height * 0.5;

      const beforeX = posX - halfW > viewport.width * 0.5;
      const afterX = posX + halfW < -viewport.width * 0.5;
      if (dirX === "right" && beforeX) item.extraX -= spanX;
      if (dirX === "left" && afterX) item.extraX += spanX;

      const beforeY = posY - halfH > viewport.height * 0.5;
      const afterY = posY + halfH < -viewport.height * 0.5;
      if (dirY === "up" && beforeY) item.extraY -= spanY;
      if (dirY === "down" && afterY) item.extraY += spanY;

      const newPosX = scroll.current.x + item.rect.x + item.extraX + parallaxX;
      const newPosY = scroll.current.y + item.rect.y + item.extraY + parallaxY;

      item.mesh.position.x = newPosX;
      item.mesh.position.y = newPosY;

      const maxBendX = MathUtils.clamp(
        scroll.delta.x.target * 0.0065,
        -0.05,
        0.05,
      );
      const maxBendY = MathUtils.clamp(
        scroll.delta.y.target * 0.0065,
        -0.05,
        0.05,
      );

      easing.damp2(
        item.mesh.material.uniforms.uScrollDelta.value,
        [maxBendX, maxBendY],
        0.05,
        delta,
      );

      item.mesh.material.uniforms.uCardSize.value.set(
        item.mesh.scale.x,
        item.mesh.scale.y,
      );

      const xOffset =
        item.mesh.position.x / (viewport.width + item.mesh.scale.x);
      const yOffset =
        item.mesh.position.y / (viewport.height + item.mesh.scale.y);

      item.mesh.material.uniforms.uParallax.value.set(
        xOffset + 0.5,
        yOffset + 0.5,
      );
    }

    gl.setRenderTarget(sourceRenderTarget);
    gl.clear();

    gl.render(sourceScene, camera);

    if (screenMaterialRef.current) {
      screenMaterialRef.current.uniforms.uTexture.value =
        sourceRenderTarget.texture;
    }

    gl.setRenderTarget(null);

    scroll.last.x = scroll.current.x;
    scroll.last.y = scroll.current.y;
  });

  return (
    <Fragment>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[size.width, size.height, 512, 1]} />
        {/* @ts-ignore */}
        <infiniteScreenMaterial
          ref={screenMaterialRef}
          uPlaneWidth={size.width}
        />
      </mesh>

      {createPortal(
        <Fragment>
          <color attach={"background"} args={["#fff"]} />
          <group>
            {Array(boxPosition.length * 4)
              .fill(0)
              .map((_, index) => {
                return (
                  <WebglPlane
                    key={index}
                    ref={(el) => {
                      if (!el) return;
                      const mesh = el as Mesh<BufferGeometry, CardMaterialImpl>;
                      const existing = planeRefs.current[index];
                      if (existing) {
                        existing.mesh = mesh;
                        return;
                      }
                      planeRefs.current[index] = {
                        mesh,
                        extraX: 0,
                        extraY: 0,
                        ease: 0,
                        rect: { x: 0, y: 0, width: 0, height: 0 },
                      };
                    }}
                    geometry={geometry}
                    textureUrl={IMAGES[index % IMAGES.length]}
                  />
                );
              })}
          </group>
        </Fragment>,
        sourceScene,
      )}
    </Fragment>
  );
}
