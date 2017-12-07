"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = concatenate;

var _take2 = _interopRequireDefault(require("lodash/take"));

var _sum2 = _interopRequireDefault(require("lodash/sum"));

var _range2 = _interopRequireDefault(require("lodash/range"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function concatenate(numInputs, inputShapes, outputShape, concatAxis) {
  const dims = inputShapes.map(shape => shape[concatAxis]);
  const offsets = (0, _range2.default)(numInputs + 1).map(i => (0, _sum2.default)((0, _take2.default)(dims, i)));
  const outVar = concatAxis === 0 ? 'out_y' : 'out_x';
  let getOffset = `
  int n = 0;
  int offset = 0;
  if (${outVar} >= ${offsets[1]} && ${outVar} < ${offsets[2]}) {
    n = 1;
    offset = ${offsets[1]};
  }`;

  if (numInputs > 2) {
    getOffset += `${(0, _range2.default)(2, numInputs).map(i => ` else if (${outVar} >= ${offsets[i]} && ${outVar} < ${offsets[i + 1]}) {
    n = ${i};
    offset = ${offsets[i]};
  }`).join('')}
`;
  }

  let outBlock = 'outColor = vec4(0.0);';

  if (concatAxis === 0 || concatAxis === 1) {
    const xCoord = i => `out_x${concatAxis === 1 ? ` - ${offsets[i]}` : ''}`;

    const yCoord = i => `out_y${concatAxis === 0 ? ` - ${offsets[i]}` : ''}`;

    outBlock = `
  if (n == 0) {
    outColor = vec4(texelFetch(inputs[0], ivec2(out_x, out_y), 0).r);
  }${(0, _range2.default)(1, numInputs).map(i => ` else if (n == ${i}) {
    outColor = vec4(texelFetch(inputs[${i}], ivec2(${xCoord(i)}, ${yCoord(i)}), 0).r);
  }`).join('')}
`;
  }

  const source = `#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D inputs[${numInputs}];
out vec4 outColor;

void main() {
  int out_y = int(float(${outputShape[0]}) * outTex.y);
  int out_x = int(float(${outputShape[1]}) * outTex.x);
${getOffset}
${outBlock}
}
`;
  return source;
}