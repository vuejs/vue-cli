"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const poolingProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D poolIndexMap;\r\nuniform int channels;\r\nuniform int poolSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  int out_x = int(float(channels) * outTex.x);\r\n  int out_y = int(float(textureSize(poolIndexMap, 0)[1]) * outTex.y);\r\n\r\n  float val = 0.;\r\n  int count = 0;\r\n  for (int i = 0; i < poolSize; ++i) {\r\n    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;\r\n    if (poolIndex != -1) {\r\n      float val2 = texelFetch(x, ivec2(out_x, poolIndex), 0).r;\r\n      if (isMaxPooling) {\r\n        if (count == 0 || val2 > val) {\r\n          val = val2;\r\n        }\r\n      } else {\r\n        val += val2;\r\n      }\r\n      count += 1;\r\n    }\r\n  }\r\n\r\n  if (!isMaxPooling) {\r\n    val /= float(count);\r\n  }\r\n\r\n  outColor = vec4(val);\r\n}\r\n";
const poolingFragmentsProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D poolIndexMap;\r\nuniform int channels;\r\nuniform int poolSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 inputSize = textureSize(x, 0);\r\n  ivec2 outputSize = textureSize(poolIndexMap, 0);\r\n  int out_x = int(float(channels) * outTex.x);\r\n  int out_y = int(float(outputSize[1]) * outTex.y);\r\n\r\n  float val = 0.;\r\n  int count = 0;\r\n  for (int i = 0; i < poolSize; ++i) {\r\n    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;\r\n    int fragmentIndex = int(floor(float(poolIndex) / float(inputSize[1])));\r\n    if (poolIndex != -1) {\r\n      poolIndex = int(mod(float(poolIndex), float(inputSize[1])));\r\n      float val2 = texelFetch(x, ivec2(fragmentIndex * channels + out_x, poolIndex), 0).r;\r\n      if (isMaxPooling) {\r\n        if (count == 0 || val2 > val) {\r\n          val = val2;\r\n        }\r\n      } else {\r\n        val += val2;\r\n      }\r\n      count += 1;\r\n    }\r\n  }\r\n\r\n  if (!isMaxPooling) {\r\n    val /= float(count);\r\n  }\r\n\r\n  outColor = vec4(val);\r\n}\r\n";

class _Pooling1D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = '_Pooling1D';
    const {
      pool_size = 2,
      strides = null,
      padding = 'valid'
    } = attrs;
    this.poolSize = pool_size;
    this.strides = strides === null ? this.poolSize : strides;
    this.padding = padding;
    this.poolingFunc = 'max';

    if (this.gpu) {
      this.poolingProgram = _WebGL.webgl2.compileProgram(poolingProgramSource);
      this.poolingFragmentsProgram = _WebGL.webgl2.compileProgram(poolingFragmentsProgramSource);
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
    const stepsNew = this.padding === 'valid' ? Math.floor((x.tensor.shape[0] - this.poolSize + this.strides) / this.strides) : Math.floor((x.tensor.shape[0] + this.strides - 1) / this.strides);
    this.output = new _Tensor.default([], [stepsNew, x.tensor.shape[1]]);
    const outputStep = new _Tensor.default([], [x.tensor.shape[1]]);
    let step = this.padding === 'valid' ? 0 : Math.min(0, Math.ceil((x.tensor.shape[0] - (stepsNew - 1) * this.strides - this.poolSize) / 2));

    for (let i = 0; i < stepsNew; i++) {
      let _step = Math.max(0, step);

      let limit = this.poolSize + Math.min(0, step);

      _ndarrayOps.default.assign(outputStep.tensor, x.tensor.pick(_step, null));

      let count = 1;

      for (let j = 1; j < limit; j++) {
        if (_step + j > x.tensor.shape[0] - 1) {
          break;
        }

        if (this.poolingFunc === 'max') {
          _ndarrayOps.default.maxeq(outputStep.tensor, x.tensor.pick(_step + j, null));
        } else if (this.poolingFunc === 'average') {
          _ndarrayOps.default.addeq(outputStep.tensor, x.tensor.pick(_step + j, null));
        }

        count += 1;
      }

      if (this.poolingFunc === 'average') {
        _ndarrayOps.default.divseq(outputStep.tensor, count);
      }

      _ndarrayOps.default.assign(this.output.tensor.pick(i, null), outputStep.tensor);

      step += this.strides;
    }
  }

  _createIndexMap() {
    if (this.poolIndexMap) {
      return;
    }

    const stepsNew = this.padding === 'valid' ? Math.floor((this.inputShape[0] - this.poolSize + this.strides) / this.strides) : Math.floor((this.inputShape[0] + this.strides - 1) / this.strides);
    this.outputShape = [stepsNew, this.inputShape[1]];
    this.poolIndexMap = new _Tensor.default([], [stepsNew, this.poolSize], {
      type: Int32Array
    });

    _ndarrayOps.default.assigns(this.poolIndexMap.tensor, -1);

    let step = this.padding === 'valid' ? 0 : Math.min(0, Math.ceil((this.inputShape[0] - (stepsNew - 1) * this.strides - this.poolSize) / 2));

    for (let i = 0; i < stepsNew; i++) {
      let _step = Math.max(0, step);

      let limit = this.poolSize + Math.min(0, step);
      let inputIndex = _step;
      this.poolIndexMap.tensor.set(i, 0, inputIndex);

      for (let j = 1; j < limit; j++) {
        inputIndex = _step + j;

        if (inputIndex <= this.inputShape[0] - 1) {
          this.poolIndexMap.tensor.set(i, j, inputIndex);
        } else {
          break;
        }
      }

      step += this.strides;
    }

    this.poolIndexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      x.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    this.inputShape = x.tensor.shape;

    this._createIndexMap();

    if (!this.output) {
      this.output = new _Tensor.default([], this.outputShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    const isMaxPooling = this.poolingFunc === 'max';
    const programUniforms = [{
      value: this.output.glTextureShape[1],
      type: 'int',
      name: 'channels'
    }, {
      value: this.poolSize,
      type: 'int',
      name: 'poolSize'
    }, {
      value: +isMaxPooling,
      type: 'bool',
      name: 'isMaxPooling'
    }];

    if (x.glTextureFragments) {
      x.convert2DRowFragmentedGLTextureToColStack();

      _WebGL.webgl2.runProgram({
        program: this.poolingFragmentsProgram,
        output: this.output,
        inputs: [{
          input: x,
          name: 'x'
        }, {
          input: this.poolIndexMap,
          name: 'poolIndexMap'
        }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      });

      x.removeGLTextureFragmentsAsColStack();
    } else {
      _WebGL.webgl2.runProgram({
        program: this.poolingProgram,
        output: this.output,
        inputs: [{
          input: x,
          name: 'x'
        }, {
          input: this.poolIndexMap,
          name: 'poolIndexMap'
        }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      });
    }

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = _Pooling1D;