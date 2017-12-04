#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D input1;
uniform sampler2D input2;
uniform int rows;
uniform int cols;
uniform int dotAxis1;
uniform int dotAxis2;
uniform int commonDim;
uniform bool normalize;
out vec4 outColor;

void main() {
  int out_x = int(float(cols) * outTex.x);
  int out_y = int(float(rows) * outTex.y);

  float sum = 0.;
  float a = 0.;
  float b = 0.;
  float norm1 = 0.;
  float norm2 = 0.;

  for (int i = 0; i < commonDim; ++i) {
    if (dotAxis1 == 0 && dotAxis2 == 0) {
      a = texelFetch(input1, ivec2(out_y, i), 0).r;
      b = texelFetch(input2, ivec2(out_x, i), 0).r;
    } else if (dotAxis1 == 1 && dotAxis2 == 1) {
      a = texelFetch(input1, ivec2(i, out_y), 0).r;
      b = texelFetch(input2, ivec2(i, out_x), 0).r;
    }

    sum += a * b;

    if (normalize) {
      norm1 += a * a;
      norm2 += b * b;
    }
  }

  if (normalize) {
    sum /= sqrt(norm1) * sqrt(norm2);
  }

  outColor = vec4(sum);
}
