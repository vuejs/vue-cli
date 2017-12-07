#version 300 es
precision highp float;
precision highp isampler2D;

in vec2 outTex;
uniform sampler2D x;
uniform isampler2D poolIndexMap;
uniform int channels;
uniform int poolSize;
uniform bool isMaxPooling;
out vec4 outColor;

void main() {
  ivec2 inputSize = textureSize(x, 0);
  ivec2 outputSize = textureSize(poolIndexMap, 0);
  int out_x = int(float(channels) * outTex.x);
  int out_y = int(float(outputSize[1]) * outTex.y);

  float val = 0.;
  int count = 0;
  for (int i = 0; i < poolSize; ++i) {
    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;
    int fragmentIndex = int(floor(float(poolIndex) / float(inputSize[1])));
    if (poolIndex != -1) {
      poolIndex = int(mod(float(poolIndex), float(inputSize[1])));
      float val2 = texelFetch(x, ivec2(fragmentIndex * channels + out_x, poolIndex), 0).r;
      if (isMaxPooling) {
        if (count == 0 || val2 > val) {
          val = val2;
        }
      } else {
        val += val2;
      }
      count += 1;
    }
  }

  if (!isMaxPooling) {
    val /= float(count);
  }

  outColor = vec4(val);
}
