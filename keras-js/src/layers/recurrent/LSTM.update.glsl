#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D c;
uniform sampler2D ctm1;
uniform sampler2D i;
uniform sampler2D f;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(c, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  float c_val = texelFetch(c, ivec2(out_x, out_y), 0).r;
  float ctm1_val = texelFetch(ctm1, ivec2(out_x, out_y), 0).r;
  float i_val = texelFetch(i, ivec2(out_x, out_y), 0).r;
  float f_val = texelFetch(f, ivec2(out_x, out_y), 0).r;

  outColor = vec4(c_val * i_val + ctm1_val * f_val);
}
