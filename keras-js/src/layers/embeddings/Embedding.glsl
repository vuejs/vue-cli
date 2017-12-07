#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
uniform sampler2D embeddings;
out vec4 outColor;

void main() {
  ivec2 x_size = textureSize(x, 0);
  ivec2 embeddings_size = textureSize(embeddings, 0);
  int out_x = int(float(embeddings_size[0]) * outTex.x);
  int out_y = int(float(x_size[0]) * outTex.y);

  int index = int(texelFetch(x, ivec2(out_y, 0), 0).r);
  outColor = texelFetch(embeddings, ivec2(out_x, index), 0);
}
