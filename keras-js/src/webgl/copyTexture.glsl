#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D source;
out vec4 outColor;

void main(void) {
  outColor = texture(source, vec2(outTex.x, outTex.y));
}
