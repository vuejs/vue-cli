/**
 * Create GLSL program for merge.Subtract layer
 *
 * @param {number} numInputs
 * @param {number[]} shape
 */
export default function subtract(numInputs, shape) {
  const source = `#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D inputs[2];
out vec4 outColor;

void main() {
  int out_y = int(float(${shape[0]}) * outTex.y);
  int out_x = int(float(${shape[1]}) * outTex.x);
  
  outColor = vec4(texelFetch(inputs[0], ivec2(out_x, out_y), 0).r - texelFetch(inputs[1], ivec2(out_x, out_y), 0).r);
}
`

  return source
}
