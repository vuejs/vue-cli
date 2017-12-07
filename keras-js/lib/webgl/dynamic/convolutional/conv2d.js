"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = conv2d;

function conv2d(outputShape, inputShape, indexMapShape, useBias, hasFragments) {
  const addBias = useBias ? `sum += texelFetch(bias, ivec2(out_x, 0), 0).r;` : '';
  const adjustIndicesForFragments = hasFragments ? `int fragmentIndex = int(floor(float(rowIndex) / float(${inputShape[0]})));
      rowIndex = int(mod(float(rowIndex), float(${inputShape[0]})));
      colIndex += fragmentIndex * ${inputShape[1]};` : '';
  const source = `#version 300 es
precision highp float;
precision highp isampler2D;

in vec2 outTex;
uniform sampler2D x;
uniform isampler2D indexMap;
uniform sampler2D kernel;
uniform sampler2D bias;
out vec4 outColor;

void main() {
  int out_y = int(float(${outputShape[0]}) * outTex.y);
  int out_x = int(float(${outputShape[1]}) * outTex.x);

  float sum = 0.;
  for (int i = 0; i < ${indexMapShape[1]}; ++i) {
    int index = texelFetch(indexMap, ivec2(i, out_y), 0).r;    
    if (index != -1) {
      int rowIndex = int(floor(float(index) / float(${inputShape[1]})));
      int colIndex = int(mod(float(index), float(${inputShape[1]})));
      ${adjustIndicesForFragments}
      sum += texelFetch(x, ivec2(colIndex, rowIndex), 0).r * texelFetch(kernel, ivec2(out_x, i), 0).r;
    }
  }

  ${addBias}
  outColor = vec4(sum);
}   
`;
  return source;
}