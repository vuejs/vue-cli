"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.linear = exports.hard_sigmoid = exports.sigmoid = exports.tanh = exports.relu = exports.softsign = exports.softplus = exports.selu = exports.elu = exports.softmax = void 0;
const softmaxProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(x, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float maxval = 0.0;\r\n  for (int i = 0; i < int(size[0]); ++i) {\r\n    float val = texelFetch(x, ivec2(i, out_y), 0).r;\r\n    if (i == 0 || val > maxval) {\r\n      maxval = val;\r\n    }\r\n  }\r\n\r\n  float sum = 0.0;\r\n  for (int i = 0; i < int(size[0]); ++i) {\r\n    float val = texelFetch(x, ivec2(i, out_y), 0).r;\r\n    sum += exp(val - maxval);\r\n  }\r\n\r\n  outColor = exp(texture(x, vec2(outTex.x, outTex.y)) - maxval) / sum;\r\n}\r\n";
exports.softmax = softmaxProgramSource;
const eluProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  float alpha = 1.0;\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  outColor = max(v, 0.0) + alpha * (exp(min(v, 0.0)) - 1.0);\r\n}\r\n";
exports.elu = eluProgramSource;
const seluProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  float alpha = 1.6732632423543772848170429916717;\r\n  float scale = 1.0507009873554804934193349852946;\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  outColor = scale * (max(v, 0.0) + alpha * (exp(min(v, 0.0)) - 1.0));\r\n}\r\n";
exports.selu = seluProgramSource;
const softplusProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  outColor = log(1.0 + exp(texture(x, vec2(outTex.x, outTex.y))));\r\n}\r\n";
exports.softplus = softplusProgramSource;
const softsignProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  v /= 1.0 + abs(v);\r\n  outColor = v;\r\n}\r\n";
exports.softsign = softsignProgramSource;
const reluProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  outColor = max(v, 0.0);\r\n}\r\n";
exports.relu = reluProgramSource;
const tanhProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  outColor = tanh(v);\r\n}\r\n";
exports.tanh = tanhProgramSource;
const sigmoidProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  outColor = 1.0 / (1.0 + exp(-1.0 * texture(x, vec2(outTex.x, outTex.y))));\r\n}\r\n";
exports.sigmoid = sigmoidProgramSource;
const hardSigmoidProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  v = v * 0.2 + 0.5;\r\n  v = max(v, 0.0);\r\n  v = min(v, 1.0);\r\n  outColor = v;\r\n}\r\n";
exports.hard_sigmoid = hardSigmoidProgramSource;
const linearProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  outColor = texture(x, vec2(outTex.x, outTex.y));\r\n}\r\n";
exports.linear = linearProgramSource;