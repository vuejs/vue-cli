#version 300 es
precision highp float;
precision highp isampler2D;

in vec2 outTex;
uniform sampler2D x;
uniform isampler2D indexMap;
uniform int inputCols;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(indexMap, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;

  if (index != -1) {
    int rowIndex = int(floor(float(index) / float(inputCols)));
    int colIndex = int(mod(float(index), float(inputCols)));
    float val = texelFetch(x, ivec2(colIndex, rowIndex), 0).r;
    outColor = vec4(val);
  } else {
    outColor = vec4(0.0);
  }
}
