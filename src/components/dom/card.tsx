import React from "react";
import Image from "next/image";
import { boxPosition, IMAGES } from "@/src/lib/static";

interface IProps {
  ref: React.Ref<HTMLDivElement> | undefined;
  index: number;
}

export function DomPlane(props: IProps) {
  const { ref, index } = props;
  return (
    <div ref={ref} className="absolute bg-[#f4f4f4]">
      <div className="relative w-full h-full overflow-hidden">
        <Image
          data-box={index}
          src={IMAGES[index % IMAGES.length]}
          alt="parallax"
          width={boxPosition[index % boxPosition.length].w}
          height={boxPosition[index % boxPosition.length].w}
          className="absolute left-[-15%]! h-[130%]! w-[130%]! max-w-none top-[-15%]! object-cover"
        />
      </div>
    </div>
  );
}
