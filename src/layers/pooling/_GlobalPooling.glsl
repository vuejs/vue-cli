#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform int channelDataSize;
uniform bool isMaxPooling;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(x, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  if (isMaxPooling) {
    // GlobalMaxPooling
    float maxval = 0.0;
    for (int j = 0; j < size[1]; ++j) {
      float val = texelFetch(x, ivec2(out_x, j), 0).r;
      if (j == 0 || val > maxval) {
        maxval = val;
      }
    }
    outColor = vec4(maxval);
  } else {
    // GlobalAveragePooling
    float sum = 0.0;
    for (int j = 0; j < size[1]; ++j) {
      float val = texelFetch(x, ivec2(out_x, j), 0).r;
      sum += val;
    }
    outColor = vec4(sum / float(channelDataSize));
  }
}
