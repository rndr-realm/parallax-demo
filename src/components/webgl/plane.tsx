import React from "react";
import { BufferGeometry, Mesh, Vector2 } from "three";
import "../../materials/card-material";
import { useLazyTexture } from "@/src/hooks/use-lazy-texture";

interface IProps {
  geometry: BufferGeometry;
  textureUrl: string;
  ref: React.Ref<Mesh> | undefined;
}

export const WebglPlane = (props: IProps) => {
  const { geometry, textureUrl, ref } = props;

  const texture = useLazyTexture(textureUrl);

  return (
    <mesh
      ref={ref}
      // ref={(el) => {
      //   if (!el) return;
      //   planeRefs.current[index] = {
      //     mesh: el as Mesh<BufferGeometry, CardMaterialImpl>,
      //     extraX: 0,
      //     extraY: 0,
      //     ease: 0,
      //     rect: { x: 0, y: 0, width: 0, height: 0 },
      //   };
      // }}
      geometry={geometry}
    >
      {/* @ts-ignore */}
      <cardMaterial
        uTexture={texture}
        uImageSize={
          new Vector2(texture?.source.data.width, texture?.source.data.height)
        }
        uTextureLoaded={texture ? 1 : 0}
      />
    </mesh>
  );
};
