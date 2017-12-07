#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D x;
out vec4 outColor;

void main() {
  float alpha = 1.6732632423543772848170429916717;
  float scale = 1.0507009873554804934193349852946;
  vec4 v = texture(x, vec2(outTex.x, outTex.y));
  outColor = scale * (max(v, 0.0) + alpha * (exp(min(v, 0.0)) - 1.0));
}
