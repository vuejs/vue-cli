"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var activations = _interopRequireWildcard(require("../../activations"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _Layer = _interopRequireDefault(require("../../Layer"));

var _WebGL = require("../../WebGL2");

var _ndarrayBlasLevel = require("ndarray-blas-level2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _cwise = _interopRequireDefault(require("cwise"));

var activationProgramSources = _interopRequireWildcard(require("../../activations/programSources"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const copyTextureProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D source;\r\nout vec4 outColor;\r\n\r\nvoid main(void) {\r\n  outColor = texture(source, vec2(outTex.x, outTex.y));\r\n}\r\n";
const matMulProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D A;\r\nuniform sampler2D B;\r\nuniform sampler2D C;\r\nuniform bool addC;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 A_size = textureSize(A, 0);\r\n  ivec2 B_size = textureSize(B, 0);\r\n  int out_x = int(float(B_size[0]) * outTex.x);\r\n  int out_y = int(float(A_size[1]) * outTex.y);\r\n  int commonDim = A_size[0];\r\n\r\n  float sum = 0.;\r\n  for (int i = 0; i < commonDim; ++i) {\r\n    float a = texelFetch(A, ivec2(i, out_y), 0).r;\r\n    float b = texelFetch(B, ivec2(out_x, i), 0).r;\r\n    sum += a * b;\r\n  }\r\n\r\n  if (addC) {\r\n    sum += texelFetch(C, ivec2(out_x, 0), 0).r;\r\n  }\r\n\r\n  outColor = vec4(sum);\r\n}\r\n";
const gateSummationProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D t1;\r\nuniform sampler2D t2;\r\nuniform sampler2D bias;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(bias, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float t1_val = texelFetch(t1, ivec2(out_x, out_y), 0).r;\r\n  float t2_val = texelFetch(t2, ivec2(out_x, out_y), 0).r;\r\n  float bias_val = texelFetch(bias, ivec2(out_x, out_y), 0).r;\r\n\r\n  outColor = vec4(t1_val + t2_val + bias_val);\r\n}\r\n";
const timestepReadProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform int index;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(x, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n\r\n  outColor = vec4(texelFetch(x, ivec2(out_x, index), 0).r);\r\n}\r\n";
const timestepWriteProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform sampler2D y;\r\nuniform int index;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(y, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  if (out_y == index) {\r\n    outColor = vec4(texelFetch(x, ivec2(out_x, 0), 0).r);\r\n  } else {\r\n    outColor = vec4(texelFetch(y, ivec2(out_x, out_y), 0).r);\r\n  }\r\n}\r\n";

class SimpleRNN extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    Object.defineProperty(this, "_combine", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (0, _cwise.default)({
        args: ['array', 'array', 'array', 'array'],
        body: function (_y, _x1, _x2, _b) {
          _y = _x1 + _x2 + _b;
        }
      })
    });
    this.layerClass = 'SimpleRNN';
    const {
      units = 1,
      activation = 'tanh',
      use_bias = true,
      return_sequences = false,
      go_backwards = false,
      stateful = false
    } = attrs;
    this.units = units;
    this.activation = activation;
    this.activationFunc = activations[activation];
    this.use_bias = use_bias;
    this.returnSequences = return_sequences;
    this.goBackwards = go_backwards;
    this.stateful = stateful;
    this.params = this.use_bias ? ['kernel', 'recurrent_kernel', 'bias'] : ['kernel', 'recurrent_kernel'];

    if (this.gpu) {
      this.copyTextureProgram = _WebGL.webgl2.compileProgram(copyTextureProgramSource);
      this.matMulProgram = _WebGL.webgl2.compileProgram(matMulProgramSource);
      this.activationProgram = _WebGL.webgl2.compileProgram(activationProgramSources[this.activation]);
      this.gateSummationProgram = _WebGL.webgl2.compileProgram(gateSummationProgramSource);
      this.timestepReadProgram = _WebGL.webgl2.compileProgram(timestepReadProgramSource);
      this.timestepWriteProgram = _WebGL.webgl2.compileProgram(timestepWriteProgramSource);
    }
  }

  setWeights(weightsArr) {
    super.setWeights(weightsArr);

    if (!this.use_bias) {
      this.weights['bias'] = new _Tensor.default([], [this.units]);

      if (this.gpu) {
        this.weights['bias'].createGLTexture({
          type: '2d',
          format: 'float'
        });
      }
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
    const dimHiddenState = this.units;
    const currentHiddenState = this.stateful && this.currentHiddenState ? this.currentHiddenState : new _Tensor.default([], [dimHiddenState]);
    const tempXH = new _Tensor.default([], [dimHiddenState]);
    const tempHH = new _Tensor.default([], [dimHiddenState]);
    const previousHiddenState = new _Tensor.default([], [dimHiddenState]);
    this.hiddenStateSequence = new _Tensor.default([], [x.tensor.shape[0], dimHiddenState]);
    const currentX = new _Tensor.default([], [x.tensor.shape[1]]);

    const _step = () => {
      _ndarrayOps.default.assign(previousHiddenState.tensor, currentHiddenState.tensor);

      (0, _ndarrayBlasLevel.gemv)(1, this.weights['kernel'].tensor.transpose(1, 0), currentX.tensor, 1, tempXH.tensor);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['recurrent_kernel'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHH.tensor);

      this._combine(currentHiddenState.tensor, tempXH.tensor, tempHH.tensor, this.weights['bias'].tensor);

      this.activationFunc(currentHiddenState);
    };

    for (let i = 0, len = x.tensor.shape[0]; i < len; i++) {
      const inputIndex = this.goBackwards ? len - i - 1 : i;

      _ndarrayOps.default.assign(currentX.tensor, x.tensor.pick(inputIndex, null));

      const tempTensors = [tempXH, tempHH];
      tempTensors.forEach(temp => _ndarrayOps.default.assigns(temp.tensor, 0));

      _step();

      if (this.returnSequences) {
        _ndarrayOps.default.assign(this.hiddenStateSequence.tensor.pick(i, null), currentHiddenState.tensor);
      }
    }

    if (this.returnSequences) {
      this.output = this.hiddenStateSequence;
    } else {
      this.output = currentHiddenState;
    }

    if (this.stateful) {
      this.currentHiddenState = currentHiddenState;
    }
  }

  _stepGPU() {
    _WebGL.webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.previousHiddenState,
      inputs: [{
        input: this.currentHiddenState,
        name: 'source'
      }]
    });

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXH,
      inputs: [{
        input: this.currentX,
        name: 'A'
      }, {
        input: this.weights['kernel'],
        name: 'B'
      }],
      uniforms: [{
        value: 0,
        type: 'bool',
        name: 'addC'
      }]
    });

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHH,
      inputs: [{
        input: this.previousHiddenState,
        name: 'A'
      }, {
        input: this.weights['recurrent_kernel'],
        name: 'B'
      }],
      uniforms: [{
        value: 0,
        type: 'bool',
        name: 'addC'
      }]
    });

    _WebGL.webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentHiddenStatePreactiv,
      inputs: [{
        input: this.tempXH,
        name: 't1'
      }, {
        input: this.tempHH,
        name: 't2'
      }, {
        input: this.weights['bias'],
        name: 'bias'
      }]
    });

    if (this.activation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.activationProgram,
        output: this.currentHiddenState,
        inputs: [{
          input: this.currentHiddenStatePreactiv,
          name: 'x'
        }]
      });
    } else {
      this.currentHiddenState = this.currentHiddenStatePreactiv;
    }
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const dimHiddenState = this.units;

    if (!this.currentHiddenState || !this.stateful) {
      this.currentHiddenState = new _Tensor.default([], [dimHiddenState]);
      this.currentHiddenState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentHiddenStatePreactiv) {
      this.currentHiddenStatePreactiv = new _Tensor.default([], [dimHiddenState]);
      this.currentHiddenStatePreactiv.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempXH) {
      this.tempXH = new _Tensor.default([], [dimHiddenState]);
      this.tempXH.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempHH) {
      this.tempHH = new _Tensor.default([], [dimHiddenState]);
      this.tempHH.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.previousHiddenState) {
      this.previousHiddenState = new _Tensor.default([], [dimHiddenState]);
      this.previousHiddenState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.hiddenStateSequence) {
      this.hiddenStateSequence = new _Tensor.default([], [x.glTextureShape[0], dimHiddenState]);
      this.hiddenStateSequence.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.hiddenStateSequenceCopy) {
      this.hiddenStateSequenceCopy = new _Tensor.default([], [x.glTextureShape[0], dimHiddenState]);
      this.hiddenStateSequenceCopy.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentX) {
      this.currentX = new _Tensor.default([], [x.glTextureShape[1]]);
      this.currentX.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    for (let i = 0, len = x.glTextureShape[0]; i < len; i++) {
      const inputIndex = this.goBackwards ? len - i - 1 : i;

      _WebGL.webgl2.runProgram({
        program: this.timestepReadProgram,
        output: this.currentX,
        inputs: [{
          input: x,
          name: 'x'
        }],
        uniforms: [{
          value: inputIndex,
          type: 'int',
          name: 'index'
        }]
      });

      this._stepGPU();

      if (this.returnSequences) {
        _WebGL.webgl2.runProgram({
          program: this.copyTextureProgram,
          output: this.hiddenStateSequenceCopy,
          inputs: [{
            input: this.hiddenStateSequence,
            name: 'source'
          }]
        });

        _WebGL.webgl2.runProgram({
          program: this.timestepWriteProgram,
          output: this.hiddenStateSequence,
          inputs: [{
            input: this.currentHiddenState,
            name: 'x'
          }, {
            input: this.hiddenStateSequenceCopy,
            name: 'y'
          }],
          uniforms: [{
            value: i,
            type: 'int',
            name: 'index'
          }]
        });
      }
    }

    if (this.returnSequences) {
      this.output = this.hiddenStateSequence;
    } else {
      this.output = this.currentHiddenState;
    }

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = SimpleRNN;