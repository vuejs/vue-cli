"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var tensorUtils = _interopRequireWildcard(require("../../utils/tensorUtils"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const poolingProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D poolIndexMap;\r\nuniform int channels;\r\nuniform int poolSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  int out_x = int(float(channels) * outTex.x);\r\n  int out_y = int(float(textureSize(poolIndexMap, 0)[1]) * outTex.y);\r\n\r\n  float val = 0.;\r\n  int count = 0;\r\n  for (int i = 0; i < poolSize; ++i) {\r\n    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;\r\n    if (poolIndex != -1) {\r\n      float val2 = texelFetch(x, ivec2(out_x, poolIndex), 0).r;\r\n      if (isMaxPooling) {\r\n        if (count == 0 || val2 > val) {\r\n          val = val2;\r\n        }\r\n      } else {\r\n        val += val2;\r\n      }\r\n      count += 1;\r\n    }\r\n  }\r\n\r\n  if (!isMaxPooling) {\r\n    val /= float(count);\r\n  }\r\n\r\n  outColor = vec4(val);\r\n}\r\n";
const poolingFragmentsProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D poolIndexMap;\r\nuniform int channels;\r\nuniform int poolSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 inputSize = textureSize(x, 0);\r\n  ivec2 outputSize = textureSize(poolIndexMap, 0);\r\n  int out_x = int(float(channels) * outTex.x);\r\n  int out_y = int(float(outputSize[1]) * outTex.y);\r\n\r\n  float val = 0.;\r\n  int count = 0;\r\n  for (int i = 0; i < poolSize; ++i) {\r\n    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;\r\n    int fragmentIndex = int(floor(float(poolIndex) / float(inputSize[1])));\r\n    if (poolIndex != -1) {\r\n      poolIndex = int(mod(float(poolIndex), float(inputSize[1])));\r\n      float val2 = texelFetch(x, ivec2(fragmentIndex * channels + out_x, poolIndex), 0).r;\r\n      if (isMaxPooling) {\r\n        if (count == 0 || val2 > val) {\r\n          val = val2;\r\n        }\r\n      } else {\r\n        val += val2;\r\n      }\r\n      count += 1;\r\n    }\r\n  }\r\n\r\n  if (!isMaxPooling) {\r\n    val /= float(count);\r\n  }\r\n\r\n  outColor = vec4(val);\r\n}\r\n";

class _Pooling3D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = '_Pooling3D';
    const {
      pool_size = [2, 2, 2],
      strides = null,
      padding = 'valid',
      data_format = 'channels_last'
    } = attrs;

    if (Array.isArray(pool_size)) {
      this.poolSize = pool_size;
    } else {
      this.poolSize = [pool_size, pool_size, pool_size];
    }

    if (Array.isArray(strides)) {
      this.strides = strides;
    } else if (strides !== null) {
      this.strides = [strides, strides, strides];
    } else {
      this.strides = this.poolSize;
    }

    this.padding = padding;
    this.dataFormat = data_format;
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

  _calcOutputShape(inputShape) {
    if (this.outputShape && this.inputPadding) {
      return;
    }

    const [inputDim1, inputDim2, inputDim3, inputChannels] = inputShape;
    const [poolDim1, poolDim2, poolDim3] = this.poolSize;
    const outputDim1 = this.padding === 'same' ? Math.floor((inputDim1 + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputDim1 - poolDim1 + this.strides[0]) / this.strides[0]);
    const outputDim2 = this.padding === 'same' ? Math.floor((inputDim2 + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputDim2 - poolDim2 + this.strides[1]) / this.strides[1]);
    const outputDim3 = this.padding === 'same' ? Math.floor((inputDim3 + this.strides[2] - 1) / this.strides[2]) : Math.floor((inputDim3 - poolDim3 + this.strides[2]) / this.strides[2]);
    const paddingDim1 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim1 - 1) * this.strides[0] + poolDim1 - inputDim1)) : 0;
    const paddingDim2 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim2 - 1) * this.strides[1] + poolDim2 - inputDim2)) : 0;
    const paddingDim3 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim3 - 1) * this.strides[2] + poolDim3 - inputDim3)) : 0;
    const paddingDim1Before = Math.floor(paddingDim1 / 2);
    const paddingDim1After = paddingDim1 - paddingDim1Before;
    const paddingDim2Before = Math.floor(paddingDim2 / 2);
    const paddingDim2After = paddingDim2 - paddingDim2Before;
    const paddingDim3Before = Math.floor(paddingDim3 / 2);
    const paddingDim3After = paddingDim3 - paddingDim3Before;
    this.outputShape = [outputDim1, outputDim2, outputDim3, inputChannels];
    this.inputPadding = [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After];
  }

  _padInput(x) {
    if (this.padding === 'same') {
      const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape;
      const [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After] = this.inputPadding;
      const newDim1 = inputDim1 + paddingDim1Before + paddingDim1After;
      const newDim2 = inputDim2 + paddingDim2Before + paddingDim2After;
      const newDim3 = inputDim3 + paddingDim3Before + paddingDim3After;

      const _x = new _Tensor.default([], [newDim1, newDim2, newDim3, inputChannels]);

      if (this.poolingFunc === 'max') {
        _ndarrayOps.default.assigns(_x.tensor, Number.NEGATIVE_INFINITY);
      }

      _ndarrayOps.default.assign(_x.tensor.hi(inputDim1 + paddingDim1Before, inputDim2 + paddingDim2Before, inputDim3 + paddingDim3Before, inputChannels).lo(paddingDim1Before, paddingDim2Before, paddingDim3Before, 0), x.tensor);

      return _x;
    }

    return x;
  }

  _callCPU(x) {
    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(1, 2, 3, 0);
    }

    this._calcOutputShape(x.tensor.shape);

    x = this._padInput(x);
    const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape;
    const [poolDim1, poolDim2, poolDim3] = this.poolSize;
    this.output = new _Tensor.default([], this.outputShape);
    let patch = new _Tensor.default([], [poolDim1, poolDim2, poolDim3, inputChannels]);
    const [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After] = this.inputPadding;

    for (let i = 0, _i = 0; i <= inputDim1 - poolDim1; i += this.strides[0], _i++) {
      let dim1InPadding = 0;

      if (i < paddingDim1Before) {
        dim1InPadding = paddingDim1Before - i;
      } else if (i + poolDim1 > inputDim1 - paddingDim1After) {
        dim1InPadding = i + poolDim1 - (inputDim1 - paddingDim1After);
      }

      for (let j = 0, _j = 0; j <= inputDim2 - poolDim2; j += this.strides[1], _j++) {
        let dim2InPadding = 0;

        if (j < paddingDim2Before) {
          dim2InPadding = paddingDim2Before - j;
        } else if (j + poolDim2 > inputDim2 - paddingDim2After) {
          dim2InPadding = j + poolDim2 - (inputDim2 - paddingDim2After);
        }

        for (let k = 0, _k = 0; k <= inputDim3 - poolDim3; k += this.strides[2], _k++) {
          let dim3InPadding = 0;

          if (k < paddingDim3Before) {
            dim3InPadding = paddingDim3Before - k;
          } else if (k + poolDim3 > inputDim3 - paddingDim3After) {
            dim3InPadding = k + poolDim3 - (inputDim3 - paddingDim3After);
          }

          const nbCellsEffective = (poolDim1 - dim1InPadding) * (poolDim2 - dim2InPadding) * (poolDim3 - dim3InPadding);

          _ndarrayOps.default.assign(patch.tensor, x.tensor.hi(i + poolDim1, j + poolDim2, k + poolDim3, inputChannels).lo(i, j, k, 0));

          for (let c = 0; c < inputChannels; c++) {
            if (this.poolingFunc === 'max') {
              this.output.tensor.set(_i, _j, _k, c, _ndarrayOps.default.sup(patch.tensor.pick(null, null, null, c)));
            } else if (this.poolingFunc === 'average') {
              this.output.tensor.set(_i, _j, _k, c, _ndarrayOps.default.sum(patch.tensor.pick(null, null, null, c)) / nbCellsEffective);
            }
          }
        }
      }
    }

    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2);
    }
  }

  _vol2col(x) {
    const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape;

    if (!this.tiledInput) {
      this.tiledInput = new _Tensor.default([], [inputDim1 * inputDim2 * inputDim3, inputChannels]);
    }

    const patch = new _Tensor.default([], [inputDim1, inputDim2, inputDim3]);
    const patchRaveled = new _Tensor.default([], [inputDim1 * inputDim2 * inputDim3]);

    for (let c = 0; c < inputChannels; c++) {
      _ndarrayOps.default.assign(patch.tensor, x.tensor.pick(null, null, null, c));

      patchRaveled.replaceTensorData(patch.tensor.data);

      _ndarrayOps.default.assign(this.tiledInput.tensor.pick(null, c), patchRaveled.tensor);
    }

    return this.tiledInput;
  }

  _createIndexMap() {
    if (this.poolIndexMap) {
      return;
    }

    let inputDim1 = this.inputShape[0];
    let inputDim2 = this.inputShape[1];
    let inputDim3 = this.inputShape[2];
    const rowIndices = new _Tensor.default([], [inputDim1, inputDim2, inputDim3]);
    let index = 0;

    for (let i = 0; i < inputDim1; i++) {
      for (let j = 0; j < inputDim2; j++) {
        for (let k = 0; k < inputDim3; k++) {
          rowIndices.tensor.set(i, j, k, index);
          index += 1;
        }
      }
    }

    if (this.padding === 'same') {
      const [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After] = this.inputPadding;
      inputDim1 = inputDim1 + paddingDim1Before + paddingDim1After;
      inputDim2 = inputDim2 + paddingDim2Before + paddingDim2After;
      inputDim3 = inputDim3 + paddingDim3Before + paddingDim3After;

      const _rowIndices = new _Tensor.default([], [inputDim1, inputDim2, inputDim3]);

      _ndarrayOps.default.assigns(_rowIndices.tensor, -1);

      _ndarrayOps.default.assign(_rowIndices.tensor.hi(this.inputShape[0] + paddingDim1Before, this.inputShape[1] + paddingDim2Before, this.inputShape[2] + paddingDim3Before).lo(paddingDim1Before, paddingDim2Before, paddingDim3Before), rowIndices.tensor);

      rowIndices.tensor = _rowIndices.tensor;
    }

    const [poolDim1, poolDim2, poolDim3] = this.poolSize;
    const outputDim1 = this.outputShape[0];
    const outputDim2 = this.outputShape[1];
    const outputDim3 = this.outputShape[2];
    this.poolIndexMap = new _Tensor.default([], [outputDim1 * outputDim2 * outputDim3, poolDim1 * poolDim2 * poolDim3], {
      type: Int32Array
    });
    const patchRow = new _Tensor.default([], [poolDim1, poolDim2, poolDim3]);
    let offset = 0;

    for (let i = 0, limit = inputDim1 - poolDim1; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputDim2 - poolDim2; j <= limit; j += this.strides[1]) {
        for (let k = 0, limit = inputDim3 - poolDim3; k <= limit; k += this.strides[2]) {
          _ndarrayOps.default.assign(patchRow.tensor, rowIndices.tensor.hi(i + poolDim1, j + poolDim2, k + poolDim3).lo(i, j, k));

          this.poolIndexMap.tensor.data.set(patchRow.tensor.data, offset);
          offset += poolDim1 * poolDim2 * poolDim3;
        }
      }
    }

    this.poolIndexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape;
    } else {
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 3, 0);
      }

      this.inputShape = x.tensor.shape;

      this._vol2col(x);

      this.tiledInput.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    this._calcOutputShape(this.inputShape);

    this._createIndexMap();

    if (!this.output) {
      const [outputDim1, outputDim2, outputDim3, inputChannels] = this.outputShape;
      const outputTextureShape = [outputDim1 * outputDim2 * outputDim3, inputChannels];
      this.output = new _Tensor.default([], outputTextureShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
      this.output.is2DReshaped = true;
      this.output.originalShape = this.outputShape;
      this.output.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1);
    }

    const input = x.is2DReshaped || x.is2DSquareReshaped ? x : this.tiledInput;
    const poolSize = this.poolSize[0] * this.poolSize[1] * this.poolSize[2];
    const isMaxPooling = this.poolingFunc === 'max';
    const programUniforms = [{
      value: this.output.glTextureShape[1],
      type: 'int',
      name: 'channels'
    }, {
      value: poolSize,
      type: 'int',
      name: 'poolSize'
    }, {
      value: +isMaxPooling,
      type: 'bool',
      name: 'isMaxPooling'
    }];

    if (input.glTextureFragments) {
      input.convert2DRowFragmentedGLTextureToColStack();

      _WebGL.webgl2.runProgram({
        program: this.poolingFragmentsProgram,
        output: this.output,
        inputs: [{
          input: input,
          name: 'x'
        }, {
          input: this.poolIndexMap,
          name: 'poolIndexMap'
        }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      });

      input.removeGLTextureFragmentsAsColStack();
    } else {
      _WebGL.webgl2.runProgram({
        program: this.poolingProgram,
        output: this.output,
        inputs: [{
          input: input,
          name: 'x'
        }, {
          input: this.poolIndexMap,
          name: 'poolIndexMap'
        }],
        uniforms: programUniforms
      });
    }

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
      this.output.reshapeFrom2D();

      if (this.dataFormat === 'channels_first') {
        this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2);
      }
    }
  }

}

exports.default = _Pooling3D;