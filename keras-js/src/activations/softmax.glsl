#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(x, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  float maxval = 0.0;
  for (int i = 0; i < int(size[0]); ++i) {
    float val = texelFetch(x, ivec2(i, out_y), 0).r;
    if (i == 0 || val > maxval) {
      maxval = val;
    }
  }

  float sum = 0.0;
  for (int i = 0; i < int(size[0]); ++i) {
    float val = texelFetch(x, ivec2(i, out_y), 0).r;
    sum += exp(val - maxval);
  }

  outColor = exp(texture(x, vec2(outTex.x, outTex.y)) - maxval) / sum;
}
