uniform float uTime;
uniform float uPlaneWidth;

uniform float uEdgeWidth;
uniform float uEdgeAngle;

varying vec2 vUv;

float PI = 3.141592653589793;

void main() {

  vec3 pos = position;

  float band = clamp(uEdgeWidth, 1e-4, 0.5);
  float theta = max(radians(clamp(uEdgeAngle, 0.0, 90.0)), 1e-4);
  float radius = band / theta; // arc length = radius * angle

  float side = uv.x < 0.5 ? -1.0 : 1.0;
  float dist = min(uv.x, 1.0 - uv.x);

  float arc = max(band - dist, 0.0);
  float phi = arc / radius;

  float rolled = band - radius * sin(phi);
  float newDist = dist < band ? rolled : dist;

  float halfWidth = (0.5 - band) + radius * sin(theta);
  float fill = 0.5 / max(halfWidth, 1e-4);

  float rolledU = 0.5 + side * (0.5 - newDist) * fill;

  pos.x = (rolledU - 0.5) * uPlaneWidth;

  pos.z -= radius * (1.0 - cos(phi)) * uPlaneWidth;

  vec4 modelPosition = modelMatrix * vec4(vec3(pos), 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;
}
