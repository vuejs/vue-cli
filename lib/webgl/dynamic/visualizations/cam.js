"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cam;

function cam(outputShape, numFeatures, weightsIs1D) {
  let source;

  if (weightsIs1D) {
    source = `#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D featureMaps;
uniform sampler2D weights;
out vec4 outColor;

void main() {
  int out_y = int(float(${outputShape[0]}) * outTex.y);
  int out_x = int(float(${outputShape[1]}) * outTex.x);

  int featureMapsRow = out_x + ${outputShape[0]} * out_y;

  float sum = 0.;
  for (int k = 0; k < ${numFeatures}; ++k) {
    float f = texelFetch(featureMaps, ivec2(k, featureMapsRow), 0).r;
    float w = texelFetch(weights, ivec2(k, 0), 0).r;
    sum += f * w;
  }

  outColor = vec4(max(sum, 0.0));
}  
`;
  } else {
    source = `#version 300 es
precision highp float;

in vec2 outTex;
uniform sampler2D featureMaps;
uniform sampler2D weights;
out vec4 outColor;

void main() {
  int out_y = int(float(${outputShape[0]}) * outTex.y);
  int out_x = int(float(${outputShape[1]}) * outTex.x);

  float sum = 0.;
  for (int k = 0; k < ${numFeatures}; ++k) {
    float f = texelFetch(featureMaps, ivec2(k, out_y), 0).r;
    float w = texelFetch(weights, ivec2(out_x, k), 0).r;
    sum += f * w;
  }

  outColor = vec4(max(sum, 0.0));
}  
`;
  }

  return source;
}