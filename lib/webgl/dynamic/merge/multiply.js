"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multiply;

var _range2 = _interopRequireDefault(require("lodash/range"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function multiply(numInputs, shape) {
  const source = `#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D inputs[${numInputs}];
out vec4 outColor;

void main() {
  int out_y = int(float(${shape[0]}) * outTex.y);
  int out_x = int(float(${shape[1]}) * outTex.x);

  outColor = vec4(${(0, _range2.default)(numInputs).map(i => `texelFetch(inputs[${i}], ivec2(out_x, out_y), 0).r`).join(' * ')});
}
`;
  return source;
}