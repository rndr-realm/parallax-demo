"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "../components/webgl/experience";

export default function Home() {
  return (
    <div className="w-full h-dvh overflow-hidden relative touch-none select-none overscroll-none bg-white">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
      >
        <Experience />
      </Canvas>
    </div>
  );
}
