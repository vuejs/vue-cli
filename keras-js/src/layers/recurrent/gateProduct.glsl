#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D t1;
uniform sampler2D t2;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(t1, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  float t1_val = texelFetch(t1, ivec2(out_x, out_y), 0).r;
  float t2_val = texelFetch(t2, ivec2(out_x, out_y), 0).r;

  outColor = vec4(t1_val * t2_val);
}
