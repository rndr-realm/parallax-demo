import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { ImageBitmapLoader, SRGBColorSpace, Texture } from "three";

export function useLazyTexture(url: string) {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<Texture<ImageBitmap> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: Texture<ImageBitmap> | null = null;

    const loader = new ImageBitmapLoader();
    // Texture.flipY is *ignored* for ImageBitmap — orientation has to be baked
    // in at decode time, or the plane renders upside down.
    loader.setOptions({ imageOrientation: "flipY" });
    loader.setCrossOrigin("anonymous");

    loader.load(
      url,
      (bitmap) => {
        if (cancelled) {
          // The decode finished after we unmounted; nothing will free this.
          bitmap.close();
          return;
        }

        const t = new Texture(bitmap);
        t.colorSpace = SRGBColorSpace;
        t.needsUpdate = true;
        // Decoding off-thread doesn't help the GPU upload — that still lands on
        // the main thread, on whatever frame first draws the texture.
        gl.initTexture(t);

        created = t;
        setTexture(t);
      },
      undefined,
      () => {
        console.warn(`[parallax] texture failed: ${url}`);
      },
    );

    return () => {
      cancelled = true;
      created?.image.close();
      created?.dispose();
    };
  }, [url, gl]);

  return texture;
}
