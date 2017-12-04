#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform float theta;
out vec4 outColor;

void main() {
  vec4 v = texture(x, vec2(outTex.x, outTex.y));
  outColor = v * float(greaterThan(v, vec4(theta)));
}
