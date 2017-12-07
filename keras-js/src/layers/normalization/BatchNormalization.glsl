#version 300 es
precision highp float;
precision highp isampler2D;

in vec2 outTex;
uniform sampler2D X;
uniform isampler2D normAxisIndexMap;
uniform sampler2D gamma;
uniform sampler2D beta;
uniform sampler2D mean;
uniform sampler2D std;
uniform float epsilon;
uniform bool scale;
uniform bool center;
out vec4 outColor;

void main() {
  ivec2 size = textureSize(X, 0);
  int out_x = int(float(size[0]) * outTex.x);
  int out_y = int(float(size[1]) * outTex.y);

int normAxisIndex = texelFetch(normAxisIndexMap, ivec2(out_x, out_y), 0).r;

  float _x = texelFetch(X, ivec2(out_x, out_y), 0).r;
  float _mean = texelFetch(mean, ivec2(normAxisIndex, 0), 0).r;
  float _std = texelFetch(std, ivec2(normAxisIndex, 0), 0).r;

  float _gamma = 1.0;
  if (scale) {
    _gamma = texelFetch(gamma, ivec2(normAxisIndex, 0), 0).r;
  }

  float _beta = 0.0;
  if (center) {
    _beta = texelFetch(beta, ivec2(normAxisIndex, 0), 0).r;
  }

  float sum = _beta + _gamma * (_x - _mean) / sqrt(_std + epsilon);

  outColor = vec4(sum);
}
