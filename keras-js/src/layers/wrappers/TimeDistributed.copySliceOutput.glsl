#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D outputCopy;
uniform sampler2D sliceOutput;
uniform int t;
uniform int timesteps;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(sliceOutput, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(timesteps) * outTex.y);

  if (t == out_y) {
    outColor = vec4(texelFetch(sliceOutput, ivec2(out_x, 0), 0).r);
  } else {
    outColor = texelFetch(outputCopy, ivec2(out_x, out_y), 0);
  }
}
