import { Vector2 } from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";

export const CardMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uTextureLoaded: 0,
    uCardSize: new Vector2(1),
    uImageSize: new Vector2(1),
    uScrollDelta: new Vector2(0),
    uParallaxRange: 1 / 1.3,
    uParallax: new Vector2(0.5),
  },
  vertexShader,
  fragmentShader,
);

extend({ CardMaterial });

export type CardMaterialImpl = InstanceType<typeof CardMaterial>;
