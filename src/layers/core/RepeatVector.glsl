#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
out vec4 outColor;

void main() {
  outColor = texture(x, vec2(outTex.x, 0));
}
