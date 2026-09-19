// precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;

uniform float uEdgeWidth;
uniform float uCurve;
uniform float uEdgeAngle;
uniform float uRefraction;
uniform float uIor;
uniform float uDispersion;

varying vec2 vUv;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y; // Aspect screen size
  float ri = i.x / i.y; // Aspect image size
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
  return u * s / st + o;
}

float edgeRoll(float u, float band, float curve) {
  float dist = min(u, 1.0 - u);
  float s = clamp(1.0 - dist / band, 0.0, 1.0);
  return pow(s, max(curve, 2.0));
}

float edgeTilt(float u, float band, float curve, float maxAngle) {
  float side = u < 0.5 ? -1.0 : 1.0;
  float theta = maxAngle * edgeRoll(u, band, curve);
  return -side * tan(theta);
}

float foldUnit(float x) {
  x = abs(x);
  return x > 1.0 ? max(2.0 - x, 0.0) : x;
}

vec2 foldUnit(vec2 uv) {
  return vec2(foldUnit(uv.x), foldUnit(uv.y));
}

vec2 refractOffset(vec3 normal, float ior) {
  vec3 incident = vec3(0.0, 0.0, -1.0);
  return refract(incident, normal, 1.0 / max(ior, 1.0)).xy;
}

void main() {
  float band = max(uEdgeWidth, 1e-4);
  float maxAngle = radians(clamp(uEdgeAngle, 0.0, 89.0));

  vec2 tilt = vec2(edgeTilt(vUv.x, band, uCurve, maxAngle), edgeTilt(vUv.y, band, uCurve, maxAngle));
  vec3 normal = normalize(vec3(tilt, 1.0));

  vec2 rOffset = refractOffset(normal, uIor * (1.0 - uDispersion)) * uRefraction;
  vec2 gOffset = refractOffset(normal, uIor) * uRefraction;
  vec2 bOffset = refractOffset(normal, uIor * (1.0 + uDispersion)) * uRefraction;

  vec3 color;
  color.r = texture2D(uTexture, foldUnit(vUv + rOffset)).r;
  color.g = texture2D(uTexture, foldUnit(vUv + gOffset)).g;
  color.b = texture2D(uTexture, foldUnit(vUv + bOffset)).b;

  gl_FragColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
