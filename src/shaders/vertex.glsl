uniform float uTime;
uniform vec2 uScrollDelta;

varying vec2 vUv;
varying vec2 relativeUv;

float PI = 3.141592653589793;

void main() {

  vec3 pos = position;

  pos.x += sin(uv.y * PI) * uScrollDelta.x;
  pos.y += sin(uv.x * PI) * uScrollDelta.y;

  vec4 modelPosition = modelMatrix * vec4(vec3(pos), 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;

  // relativeUv = vec2(normalizedPosX, normalizedPosY);
}
