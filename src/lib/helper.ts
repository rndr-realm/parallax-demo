export function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Size = {
  width: number;
  height: number;
};

export function rectToWebgl(rect: Rect, size: Size) {
  return {
    x: rect.left + rect.width * 0.5 - size.width * 0.5,
    y: size.height * 0.5 - rect.top - rect.height * 0.5,
    width: rect.width,
    height: rect.height,
  };
}
