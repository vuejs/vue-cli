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
const gateProductProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D t1;\r\nuniform sampler2D t2;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(t1, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float t1_val = texelFetch(t1, ivec2(out_x, out_y), 0).r;\r\n  float t2_val = texelFetch(t2, ivec2(out_x, out_y), 0).r;\r\n\r\n  outColor = vec4(t1_val * t2_val);\r\n}\r\n";
const timestepReadProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform int index;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(x, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n\r\n  outColor = vec4(texelFetch(x, ivec2(out_x, index), 0).r);\r\n}\r\n";
const timestepWriteProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform sampler2D y;\r\nuniform int index;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(y, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  if (out_y == index) {\r\n    outColor = vec4(texelFetch(x, ivec2(out_x, 0), 0).r);\r\n  } else {\r\n    outColor = vec4(texelFetch(y, ivec2(out_x, out_y), 0).r);\r\n  }\r\n}\r\n";
const updateProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D c;\r\nuniform sampler2D ctm1;\r\nuniform sampler2D i;\r\nuniform sampler2D f;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(c, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float c_val = texelFetch(c, ivec2(out_x, out_y), 0).r;\r\n  float ctm1_val = texelFetch(ctm1, ivec2(out_x, out_y), 0).r;\r\n  float i_val = texelFetch(i, ivec2(out_x, out_y), 0).r;\r\n  float f_val = texelFetch(f, ivec2(out_x, out_y), 0).r;\r\n\r\n  outColor = vec4(c_val * i_val + ctm1_val * f_val);\r\n}\r\n";

class LSTM extends _Layer.default {
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
    Object.defineProperty(this, "_update", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (0, _cwise.default)({
        args: ['array', 'array', 'array', 'array'],
        body: function (_c, _ctm1, _i, _f) {
          _c = _c * _i + _ctm1 * _f;
        }
      })
    });
    this.layerClass = 'LSTM';
    const {
      units = 1,
      activation = 'tanh',
      use_bias = true,
      recurrent_activation = 'hard_sigmoid',
      return_sequences = false,
      go_backwards = false,
      stateful = false
    } = attrs;
    this.units = units;
    this.activation = activation;
    this.recurrentActivation = recurrent_activation;
    this.activationFunc = activations[activation];
    this.recurrentActivationFunc = activations[recurrent_activation];
    this.use_bias = use_bias;
    this.returnSequences = return_sequences;
    this.goBackwards = go_backwards;
    this.stateful = stateful;
    this.params = this.use_bias ? ['kernel', 'recurrent_kernel', 'bias'] : ['kernel', 'recurrent_kernel'];

    if (this.gpu) {
      this.copyTextureProgram = _WebGL.webgl2.compileProgram(copyTextureProgramSource);
      this.matMulProgram = _WebGL.webgl2.compileProgram(matMulProgramSource);
      this.activationProgram = _WebGL.webgl2.compileProgram(activationProgramSources[this.activation]);
      this.recurrentActivationProgram = _WebGL.webgl2.compileProgram(activationProgramSources[this.recurrentActivation]);
      this.gateSummationProgram = _WebGL.webgl2.compileProgram(gateSummationProgramSource);
      this.gateProductProgram = _WebGL.webgl2.compileProgram(gateProductProgramSource);
      this.timestepReadProgram = _WebGL.webgl2.compileProgram(timestepReadProgramSource);
      this.timestepWriteProgram = _WebGL.webgl2.compileProgram(timestepWriteProgramSource);
      this.updateProgram = _WebGL.webgl2.compileProgram(updateProgramSource);
    }
  }

  setWeights(weightsArr) {
    super.setWeights(weightsArr);
    const shape_W = this.weights['kernel'].tensor.shape;
    this.weights['W_i'] = new _Tensor.default([], [shape_W[0], this.units]);
    this.weights['W_f'] = new _Tensor.default([], [shape_W[0], this.units]);
    this.weights['W_c'] = new _Tensor.default([], [shape_W[0], this.units]);
    this.weights['W_o'] = new _Tensor.default([], [shape_W[0], this.units]);

    _ndarrayOps.default.assign(this.weights['W_i'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], this.units).lo(0, 0));

    _ndarrayOps.default.assign(this.weights['W_f'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 2 * this.units).lo(0, this.units));

    _ndarrayOps.default.assign(this.weights['W_c'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 3 * this.units).lo(0, 2 * this.units));

    _ndarrayOps.default.assign(this.weights['W_o'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 4 * this.units).lo(0, 3 * this.units));

    const shape_U = this.weights['recurrent_kernel'].tensor.shape;
    this.weights['U_i'] = new _Tensor.default([], [shape_U[0], this.units]);
    this.weights['U_f'] = new _Tensor.default([], [shape_U[0], this.units]);
    this.weights['U_c'] = new _Tensor.default([], [shape_U[0], this.units]);
    this.weights['U_o'] = new _Tensor.default([], [shape_U[0], this.units]);

    _ndarrayOps.default.assign(this.weights['U_i'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], this.units).lo(0, 0));

    _ndarrayOps.default.assign(this.weights['U_f'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 2 * this.units).lo(0, this.units));

    _ndarrayOps.default.assign(this.weights['U_c'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 3 * this.units).lo(0, 2 * this.units));

    _ndarrayOps.default.assign(this.weights['U_o'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 4 * this.units).lo(0, 3 * this.units));

    this.weights['b_i'] = new _Tensor.default([], [this.units]);
    this.weights['b_f'] = new _Tensor.default([], [this.units]);
    this.weights['b_c'] = new _Tensor.default([], [this.units]);
    this.weights['b_o'] = new _Tensor.default([], [this.units]);

    if (this.use_bias) {
      _ndarrayOps.default.assign(this.weights['b_i'].tensor, this.weights['bias'].tensor.hi(this.units).lo(0));

      _ndarrayOps.default.assign(this.weights['b_f'].tensor, this.weights['bias'].tensor.hi(2 * this.units).lo(this.units));

      _ndarrayOps.default.assign(this.weights['b_c'].tensor, this.weights['bias'].tensor.hi(3 * this.units).lo(2 * this.units));

      _ndarrayOps.default.assign(this.weights['b_o'].tensor, this.weights['bias'].tensor.hi(4 * this.units).lo(3 * this.units));
    }

    if (this.gpu) {
      const names = ['W_i', 'W_f', 'W_c', 'W_o', 'U_i', 'U_f', 'U_c', 'U_o', 'b_i', 'b_f', 'b_c', 'b_o'];
      names.forEach(name => {
        this.weights[name].createGLTexture({
          type: '2d',
          format: 'float'
        });
      });
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
    const dimInputGate = this.weights['b_i'].tensor.shape[0];
    const dimCandidate = this.weights['b_c'].tensor.shape[0];
    const dimForgetGate = this.weights['b_f'].tensor.shape[0];
    const dimOutputGate = this.weights['b_o'].tensor.shape[0];
    const currentInputGateState = new _Tensor.default([], [dimInputGate]);
    const tempXI = new _Tensor.default([], [dimInputGate]);
    const tempHI = new _Tensor.default([], [dimInputGate]);
    const currentForgetGateState = new _Tensor.default([], [dimForgetGate]);
    const tempXF = new _Tensor.default([], [dimForgetGate]);
    const tempHF = new _Tensor.default([], [dimForgetGate]);
    const currentOutputGateState = new _Tensor.default([], [dimOutputGate]);
    const tempXO = new _Tensor.default([], [dimOutputGate]);
    const tempHO = new _Tensor.default([], [dimOutputGate]);
    const currentCandidate = new _Tensor.default([], [dimCandidate]);
    const tempXC = new _Tensor.default([], [dimCandidate]);
    const tempHC = new _Tensor.default([], [dimCandidate]);
    const previousCandidate = this.stateful && this.previousCandidate ? this.previousCandidate : new _Tensor.default([], [dimCandidate]);
    const currentHiddenState = this.stateful && this.currentHiddenState ? this.currentHiddenState : new _Tensor.default([], [dimCandidate]);
    const previousHiddenState = new _Tensor.default([], [dimCandidate]);
    this.hiddenStateSequence = new _Tensor.default([], [x.tensor.shape[0], dimCandidate]);
    const currentX = new _Tensor.default([], [x.tensor.shape[1]]);

    const _step = () => {
      _ndarrayOps.default.assign(previousHiddenState.tensor, currentHiddenState.tensor);

      (0, _ndarrayBlasLevel.gemv)(1, this.weights['W_i'].tensor.transpose(1, 0), currentX.tensor, 1, tempXI.tensor);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['U_i'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHI.tensor);

      this._combine(currentInputGateState.tensor, tempXI.tensor, tempHI.tensor, this.weights['b_i'].tensor);

      this.recurrentActivationFunc(currentInputGateState);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['W_f'].tensor.transpose(1, 0), currentX.tensor, 1, tempXF.tensor);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['U_f'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHF.tensor);

      this._combine(currentForgetGateState.tensor, tempXF.tensor, tempHF.tensor, this.weights['b_f'].tensor);

      this.recurrentActivationFunc(currentForgetGateState);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['W_o'].tensor.transpose(1, 0), currentX.tensor, 1, tempXO.tensor);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['U_o'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHO.tensor);

      this._combine(currentOutputGateState.tensor, tempXO.tensor, tempHO.tensor, this.weights['b_o'].tensor);

      this.recurrentActivationFunc(currentOutputGateState);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['W_c'].tensor.transpose(1, 0), currentX.tensor, 1, tempXC.tensor);
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['U_c'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHC.tensor);

      this._combine(currentCandidate.tensor, tempXC.tensor, tempHC.tensor, this.weights['b_c'].tensor);

      this.activationFunc(currentCandidate);

      this._update(currentCandidate.tensor, previousCandidate.tensor, currentInputGateState.tensor, currentForgetGateState.tensor);

      _ndarrayOps.default.assign(previousCandidate.tensor, currentCandidate.tensor);

      this.activationFunc(currentCandidate);

      _ndarrayOps.default.mul(currentHiddenState.tensor, currentOutputGateState.tensor, currentCandidate.tensor);
    };

    for (let i = 0, len = x.tensor.shape[0]; i < len; i++) {
      const inputIndex = this.goBackwards ? len - i - 1 : i;

      _ndarrayOps.default.assign(currentX.tensor, x.tensor.pick(inputIndex, null));

      const tempTensors = [tempXI, tempHI, tempXF, tempHF, tempXO, tempHO, tempXC, tempHC];
      tempTensors.forEach(temp => _ndarrayOps.default.assigns(temp.tensor, 0));

      _step();

      _ndarrayOps.default.assign(this.hiddenStateSequence.tensor.pick(i, null), currentHiddenState.tensor);
    }

    if (this.returnSequences) {
      this.output = this.hiddenStateSequence;
    } else {
      this.output = currentHiddenState;
    }

    if (this.stateful) {
      this.previousCandidate = previousCandidate;
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
      output: this.tempXI,
      inputs: [{
        input: this.currentX,
        name: 'A'
      }, {
        input: this.weights['W_i'],
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
      output: this.tempHI,
      inputs: [{
        input: this.previousHiddenState,
        name: 'A'
      }, {
        input: this.weights['U_i'],
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
      output: this.currentInputGateStatePreactiv,
      inputs: [{
        input: this.tempXI,
        name: 't1'
      }, {
        input: this.tempHI,
        name: 't2'
      }, {
        input: this.weights['b_i'],
        name: 'bias'
      }]
    });

    if (this.recurrentActivation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentInputGateState,
        inputs: [{
          input: this.currentInputGateStatePreactiv,
          name: 'x'
        }]
      });
    } else {
      this.currentInputGateState = this.currentInputGateStatePreactiv;
    }

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXF,
      inputs: [{
        input: this.currentX,
        name: 'A'
      }, {
        input: this.weights['W_f'],
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
      output: this.tempHF,
      inputs: [{
        input: this.previousHiddenState,
        name: 'A'
      }, {
        input: this.weights['U_f'],
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
      output: this.currentForgetGateStatePreactiv,
      inputs: [{
        input: this.tempXF,
        name: 't1'
      }, {
        input: this.tempHF,
        name: 't2'
      }, {
        input: this.weights['b_f'],
        name: 'bias'
      }]
    });

    if (this.recurrentActivation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentForgetGateState,
        inputs: [{
          input: this.currentForgetGateStatePreactiv,
          name: 'x'
        }]
      });
    } else {
      this.currentForgetGateState = this.currentForgetGateStatePreactiv;
    }

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXO,
      inputs: [{
        input: this.currentX,
        name: 'A'
      }, {
        input: this.weights['W_o'],
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
      output: this.tempHO,
      inputs: [{
        input: this.previousHiddenState,
        name: 'A'
      }, {
        input: this.weights['U_o'],
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
      output: this.currentOutputGateStatePreactiv,
      inputs: [{
        input: this.tempXO,
        name: 't1'
      }, {
        input: this.tempHO,
        name: 't2'
      }, {
        input: this.weights['b_o'],
        name: 'bias'
      }]
    });

    if (this.recurrentActivation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentOutputGateState,
        inputs: [{
          input: this.currentOutputGateStatePreactiv,
          name: 'x'
        }]
      });
    } else {
      this.currentOutputGateState = this.currentOutputGateStatePreactiv;
    }

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXC,
      inputs: [{
        input: this.currentX,
        name: 'A'
      }, {
        input: this.weights['W_c'],
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
      output: this.tempHC,
      inputs: [{
        input: this.previousHiddenState,
        name: 'A'
      }, {
        input: this.weights['U_c'],
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
      output: this.currentCandidatePreactiv,
      inputs: [{
        input: this.tempXC,
        name: 't1'
      }, {
        input: this.tempHC,
        name: 't2'
      }, {
        input: this.weights['b_c'],
        name: 'bias'
      }]
    });

    if (this.activation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.activationProgram,
        output: this.currentCandidate,
        inputs: [{
          input: this.currentCandidatePreactiv,
          name: 'x'
        }]
      });
    } else {
      this.currentCandidate = this.currentCandidatePreactiv;
    }

    _WebGL.webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.currentCandidateCopy,
      inputs: [{
        input: this.currentCandidate,
        name: 'source'
      }]
    });

    _WebGL.webgl2.runProgram({
      program: this.updateProgram,
      output: this.currentCandidate,
      inputs: [{
        input: this.currentCandidateCopy,
        name: 'c'
      }, {
        input: this.previousCandidate,
        name: 'ctm1'
      }, {
        input: this.currentInputGateState,
        name: 'i'
      }, {
        input: this.currentForgetGateState,
        name: 'f'
      }]
    });

    _WebGL.webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.previousCandidate,
      inputs: [{
        input: this.currentCandidate,
        name: 'source'
      }]
    });

    _WebGL.webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.currentCandidatePreactiv,
      inputs: [{
        input: this.currentCandidate,
        name: 'source'
      }]
    });

    if (this.activation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.activationProgram,
        output: this.currentCandidate,
        inputs: [{
          input: this.currentCandidatePreactiv,
          name: 'x'
        }]
      });
    } else {
      this.currentCandidate = this.currentCandidatePreactiv;
    }

    _WebGL.webgl2.runProgram({
      program: this.gateProductProgram,
      output: this.currentHiddenState,
      inputs: [{
        input: this.currentOutputGateState,
        name: 't1'
      }, {
        input: this.currentCandidate,
        name: 't2'
      }]
    });
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const dimInputGate = this.weights['b_i'].glTextureShape[1];
    const dimCandidate = this.weights['b_c'].glTextureShape[1];
    const dimForgetGate = this.weights['b_f'].glTextureShape[1];
    const dimOutputGate = this.weights['b_o'].glTextureShape[1];

    if (!this.currentInputGateState) {
      this.currentInputGateState = new _Tensor.default([], [dimInputGate]);
      this.currentInputGateState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentInputGateStatePreactiv) {
      this.currentInputGateStatePreactiv = new _Tensor.default([], [dimInputGate]);
      this.currentInputGateStatePreactiv.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempXI) {
      this.tempXI = new _Tensor.default([], [dimInputGate]);
      this.tempXI.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempHI) {
      this.tempHI = new _Tensor.default([], [dimInputGate]);
      this.tempHI.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentForgetGateState) {
      this.currentForgetGateState = new _Tensor.default([], [dimForgetGate]);
      this.currentForgetGateState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentForgetGateStatePreactiv) {
      this.currentForgetGateStatePreactiv = new _Tensor.default([], [dimForgetGate]);
      this.currentForgetGateStatePreactiv.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempXF) {
      this.tempXF = new _Tensor.default([], [dimForgetGate]);
      this.tempXF.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempHF) {
      this.tempHF = new _Tensor.default([], [dimForgetGate]);
      this.tempHF.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentOutputGateState) {
      this.currentOutputGateState = new _Tensor.default([], [dimOutputGate]);
      this.currentOutputGateState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentOutputGateStatePreactiv) {
      this.currentOutputGateStatePreactiv = new _Tensor.default([], [dimOutputGate]);
      this.currentOutputGateStatePreactiv.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempXO) {
      this.tempXO = new _Tensor.default([], [dimOutputGate]);
      this.tempXO.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempHO) {
      this.tempHO = new _Tensor.default([], [dimOutputGate]);
      this.tempHO.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentCandidate) {
      this.currentCandidate = new _Tensor.default([], [dimCandidate]);
      this.currentCandidate.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentCandidateCopy) {
      this.currentCandidateCopy = new _Tensor.default([], [dimCandidate]);
      this.currentCandidateCopy.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentCandidatePreactiv) {
      this.currentCandidatePreactiv = new _Tensor.default([], [dimCandidate]);
      this.currentCandidatePreactiv.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempXC) {
      this.tempXC = new _Tensor.default([], [dimCandidate]);
      this.tempXC.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.tempHC) {
      this.tempHC = new _Tensor.default([], [dimCandidate]);
      this.tempHC.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.previousCandidate || !this.stateful) {
      this.previousCandidate = new _Tensor.default([], [dimCandidate]);
      this.previousCandidate.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.currentHiddenState || !this.stateful) {
      this.currentHiddenState = new _Tensor.default([], [dimCandidate]);
      this.currentHiddenState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.previousHiddenState) {
      this.previousHiddenState = new _Tensor.default([], [dimCandidate]);
      this.previousHiddenState.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.hiddenStateSequence) {
      this.hiddenStateSequence = new _Tensor.default([], [x.glTextureShape[0], dimCandidate]);
      this.hiddenStateSequence.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.hiddenStateSequenceCopy) {
      this.hiddenStateSequenceCopy = new _Tensor.default([], [x.glTextureShape[0], dimCandidate]);
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

exports.default = LSTM;