#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform sampler2D y;
uniform int index;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(y, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  if (out_y == index) {
    outColor = vec4(texelFetch(x, ivec2(out_x, 0), 0).r);
  } else {
    outColor = vec4(texelFetch(y, ivec2(out_x, out_y), 0).r);
  }
}
