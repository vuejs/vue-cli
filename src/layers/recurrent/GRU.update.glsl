#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D h;
uniform sampler2D htm1;
uniform sampler2D z;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(h, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  float h_val = texelFetch(h, ivec2(out_x, out_y), 0).r;
  float htm1_val = texelFetch(htm1, ivec2(out_x, out_y), 0).r;
  float z_val = texelFetch(z, ivec2(out_x, out_y), 0).r;

  outColor = vec4(h_val * (float(1.0) - z_val) + htm1_val * z_val);
}
