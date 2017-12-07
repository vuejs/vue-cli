#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D A;
uniform sampler2D B;
uniform sampler2D C;
uniform bool addC;
out vec4 outColor;

void main() {
  ivec2 A_size = textureSize(A, 0);
  ivec2 B_size = textureSize(B, 0);
  int out_x = int(float(B_size[0]) * outTex.x);
  int out_y = int(float(A_size[1]) * outTex.y);
  int commonDim = A_size[0];

  float sum = 0.;
  for (int i = 0; i < commonDim; ++i) {
    float a = texelFetch(A, ivec2(i, out_y), 0).r;
    float b = texelFetch(B, ivec2(out_x, i), 0).r;
    sum += a * b;
  }

  if (addC) {
    sum += texelFetch(C, ivec2(out_x, 0), 0).r;
  }

  outColor = vec4(sum);
}
