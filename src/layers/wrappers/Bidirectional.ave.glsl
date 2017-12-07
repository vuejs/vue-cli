#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D forward;
uniform sampler2D backward;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(forward, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

  float forward_val = texelFetch(forward, ivec2(out_x, out_y), 0).r;
  float backward_val = texelFetch(backward, ivec2(out_x, size[1] - out_y - 1), 0).r;

  outColor = vec4(0.5 * (forward_val + backward_val));
}
