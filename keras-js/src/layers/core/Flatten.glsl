#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform int outputSize;
uniform int inputCols;
out vec4 outColor;

void main() {
  int out_x = int(float(outputSize) * outTex.x);
  int out_y = 0;

  int i = int(floor(float(out_x) / float(inputCols)));
  int j = int(mod(float(out_x), float(inputCols)));
  outColor = vec4(texelFetch(x, ivec2(j, i), 0).r);
}
