#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform int outputSize;
uniform int inputRows;
uniform int inputCols;
out vec4 outColor;

void main() {
  int out_x = int(float(outputSize) * outTex.x);
  int out_y = 0;

  int rowIndex = int(mod(floor(float(out_x) / float(inputCols)), float(inputRows)));
  int colIndex = int(mod(float(out_x), float(inputCols)));
  int fragmentIndex = int(floor(float(out_x) / (float(inputRows) * float(inputCols))));
  colIndex += fragmentIndex * inputCols;
  outColor = vec4(texelFetch(x, ivec2(colIndex, rowIndex), 0).r);
}
