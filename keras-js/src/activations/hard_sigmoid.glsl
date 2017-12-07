#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
out vec4 outColor;

void main() {
  vec4 v = texture(x, vec2(outTex.x, outTex.y));
  v = v * 0.2 + 0.5;
  v = max(v, 0.0);
  v = min(v, 1.0);
  outColor = v;
}
