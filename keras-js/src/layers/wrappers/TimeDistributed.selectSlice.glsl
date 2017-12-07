#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform int t;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(x, 0);
  int out_x = int(float(size[0]) * outTex.x);

  outColor = vec4(texelFetch(x, ivec2(out_x, t), 0).r);
}
