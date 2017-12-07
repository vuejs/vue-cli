#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
out vec4 outColor;

void main() {
  outColor = 1.0 / (1.0 + exp(-1.0 * texture(x, vec2(outTex.x, outTex.y))));
}
