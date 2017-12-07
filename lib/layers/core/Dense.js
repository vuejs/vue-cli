"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var activations = _interopRequireWildcard(require("../../activations"));

var _WebGL = require("../../WebGL2");

var _ndarrayBlasLevel = require("ndarray-blas-level2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var activationProgramSources = _interopRequireWildcard(require("../../activations/programSources"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const matMulProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D A;\r\nuniform sampler2D B;\r\nuniform sampler2D C;\r\nuniform bool addC;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 A_size = textureSize(A, 0);\r\n  ivec2 B_size = textureSize(B, 0);\r\n  int out_x = int(float(B_size[0]) * outTex.x);\r\n  int out_y = int(float(A_size[1]) * outTex.y);\r\n  int commonDim = A_size[0];\r\n\r\n  float sum = 0.;\r\n  for (int i = 0; i < commonDim; ++i) {\r\n    float a = texelFetch(A, ivec2(i, out_y), 0).r;\r\n    float b = texelFetch(B, ivec2(out_x, i), 0).r;\r\n    sum += a * b;\r\n  }\r\n\r\n  if (addC) {\r\n    sum += texelFetch(C, ivec2(out_x, 0), 0).r;\r\n  }\r\n\r\n  outColor = vec4(sum);\r\n}\r\n";

class Dense extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Dense';
    const {
      units = 1,
      activation = 'linear',
      input_dim = null,
      use_bias = true
    } = attrs;
    this.activation = activation;
    this.activationFunc = activations[this.activation];
    this.units = units;
    this.input_dim = input_dim;
    this.use_bias = use_bias;
    this.params = this.use_bias ? ['kernel', 'bias'] : ['kernel'];

    if (this.input_dim) {
      this.inputShape = [this.input_dim];
    }

    if (this.gpu) {
      this.matMulProgram = _WebGL.webgl2.compileProgram(matMulProgramSource);
      this.activationProgram = _WebGL.webgl2.compileProgram(activationProgramSources[this.activation]);
    }
  }

  call(x) {
    if (this.gpu) {
      this._callGPU(x);
    } else {
      this._callCPU(x);
    }

    return this.output;
  }

  _callCPU(x) {
    this.output = new _Tensor.default([], [this.units]);

    if (this.use_bias) {
      _ndarrayOps.default.assign(this.output.tensor, this.weights['bias'].tensor);
    }

    (0, _ndarrayBlasLevel.gemv)(1, this.weights['kernel'].tensor.transpose(1, 0), x.tensor, 1, this.output.tensor);
    this.activationFunc(this.output);
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (this.activation !== 'linear' && !this.outputPreactiv) {
      this.outputPreactiv = new _Tensor.default([], [this.units]);
      this.outputPreactiv.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.output) {
      this.output = new _Tensor.default([], [this.units]);
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const matMulInputs = [{
      input: x,
      name: 'A'
    }, {
      input: this.weights['kernel'],
      name: 'B'
    }];

    if (this.use_bias) {
      matMulInputs.push({
        input: this.weights['bias'],
        name: 'C'
      });
    }

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.activation === 'linear' ? this.output : this.outputPreactiv,
      inputs: matMulInputs,
      uniforms: [{
        value: this.use_bias ? 1 : 0,
        type: 'bool',
        name: 'addC'
      }]
    });

    if (this.activation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.activationProgram,
        output: this.output,
        inputs: [{
          input: this.outputPreactiv,
          name: 'x'
        }]
      });
    }

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = Dense;