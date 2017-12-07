#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform sampler2D alpha;
out vec4 outColor;

void main() {
  vec4 v = texture(x, vec2(outTex.x, outTex.y));
  vec4 a = texture(alpha, vec2(outTex.x, outTex.y));
  outColor = max(v, 0.0) + a * min(v, 0.0);
}
