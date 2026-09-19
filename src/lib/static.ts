export const IMAGES = [
  "https://cdn.cosmos.so/7b93e7f7-8e29-4562-981a-a61f3b27a3d2?format=webp",
  "https://cdn.cosmos.so/365fd74b-5d3b-495c-9d12-ef4fcf99b9a8?format=webp",
  "https://cdn.cosmos.so/28434494-55ef-4f49-a9c3-f74de603c313?format=webp",
  "https://cdn.cosmos.so/ff1029b3-c08a-47fb-a436-d16d88a3773e?format=webp&w=2048",
  "https://cdn.cosmos.so/6e6401e1-b172-4cc8-a696-dcf783241bb2?format=webp",
  "https://cdn.cosmos.so/88ba8b97-6ed7-4a89-8238-72ea9e2a4a19?format=webp",
  "https://cdn.cosmos.so/18cb2fa2-5445-4b4c-8023-b49c7930a8fd?format=webp&w=2048",
  "https://cdn.cosmos.so/bade8c5e-d0e8-40da-9d22-86df4e814de5?format=webp",
  "https://cdn.cosmos.so/80dd635c-3f0f-42dc-9fa9-5f5a9d70e651?format=webp",
  "https://cdn.cosmos.so/7a18c8dd-2d81-431d-8d00-f4e8a4b8f86d?format=webp",
];

export const boxPosition = [
  { id: 0, x: 458, y: 353, w: 340, h: 230, color: "#737373" },
  { id: 1, x: 758, y: 68, w: 460, h: 310, color: "#c2c2c2" },
  { id: 2, x: 569, y: 610, w: 300, h: 300, color: "#e0e0e0" },
  { id: 3, x: 895, y: 631, w: 400, h: 270, color: "#a3a3a3" },
  { id: 4, x: 189, y: 872, w: 420, h: 280, color: "#8a8a8a" },
  { id: 5, x: 88, y: 422, w: 200, h: 300, color: "#3d3d3d" },
  { id: 6, x: 464, y: 87, w: 260, h: 260, color: "#2e2e2e" },
  { id: 7, x: 1270, y: 339, w: 220, h: 330, color: "#1f1f1f" },
  { id: 8, x: 674, y: 911, w: 340, h: 230, color: "#4d4d4d" },
  { id: 9, x: 1310, y: 682, w: 200, h: 300, color: "#5f5f5f" },
];

export const originalSize = { w: 1600, h: 1200 };

export const createScrollValues = () => ({
  ease: 0.06,
  current: { x: 0, y: 0 },
  target: { x: 0, y: 0 },
  last: { x: 0, y: 0 },
  delta: {
    x: {
      current: 0,
      target: 0,
    },
    y: {
      current: 0,
      target: 0,
    },
  },
});

export const createDragValues = () => ({
  // the finger/mouse that owns the drag; every other pointer is ignored
  pointerId: null as number | null,
  time: 0,
  x: { start: 0, scroll: 0, last: 0, velocity: 0 },
  y: { start: 0, scroll: 0, last: 0, velocity: 0 },
});

export const createMousePositionValues = () => ({
  x: {
    target: 0.5,
    current: 0.5,
  },
  y: {
    target: 0.5,
    current: 0.5,
  },
});

export const MOUSE_EASE = 0.04 * 1;
// how far a flick is projected past the release point, in ms of travel
export const FLICK_STRENGTH = 150 * 1.5;
// a finger that rests this long before lifting is not a flick
export const FLICK_TIMEOUT = 100;
export const VELOCITY_EASE = 0.3;
