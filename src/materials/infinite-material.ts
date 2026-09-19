import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import vertexShader from "../shaders/screen-vertex.glsl";
import fragmentShader from "../shaders/screen-fragment.glsl";

export const InfiniteScreenMaterial = shaderMaterial(
  {
    uTexture: null,
    uTime: 0,
    uPlaneWidth: 1,
    uEdgeWidth: 0.05,
    uCurve: 3,
    uEdgeAngle: 65,
    uRefraction: -0.06,
    uIor: 1.45,
    uDispersion: 0.06,
  },
  vertexShader,
  fragmentShader,
);

extend({ InfiniteScreenMaterial });

export type InfiniteScreenMaterialImpl = InstanceType<
  typeof InfiniteScreenMaterial
>;
