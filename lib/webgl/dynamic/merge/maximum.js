"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = maximum;

function maximum(numInputs, shape) {
  const source = `#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D inputs[${numInputs}];
out vec4 outColor;

void main() {
  int out_y = int(float(${shape[0]}) * outTex.y);
  int out_x = int(float(${shape[1]}) * outTex.x);

  float val = texelFetch(inputs[0], ivec2(out_x, out_y), 0).r;
  for (int i = 1; i < ${numInputs}; i++) {
    val = max(val, texelFetch(inputs[i], ivec2(out_x, out_y), 0).r);
  }

  outColor = vec4(val);
}
`;
  return source;
}