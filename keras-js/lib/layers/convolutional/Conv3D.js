"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var activations = _interopRequireWildcard(require("../../activations"));

var _WebGL = require("../../WebGL2");

var _createGLSLProgram = _interopRequireDefault(require("../../webgl/dynamic/createGLSLProgram"));

var tensorUtils = _interopRequireWildcard(require("../../utils/tensorUtils"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _ndarrayGemm = _interopRequireDefault(require("ndarray-gemm"));

var activationProgramSources = _interopRequireWildcard(require("../../activations/programSources"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mapInputProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D indexMap;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(indexMap, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  if (index != -1) {\r\n    int rowIndex = int(floor(float(index) / float(inputCols)));\r\n    int colIndex = int(mod(float(index), float(inputCols)));\r\n    float val = texelFetch(x, ivec2(colIndex, rowIndex), 0).r;\r\n    outColor = vec4(val);\r\n  } else {\r\n    outColor = vec4(0.0);\r\n  }\r\n}\r\n";
const mapInputFragmentsProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D indexMap;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 inputSize = textureSize(x, 0);\r\n  ivec2 outputSize = textureSize(indexMap, 0);\r\n  int out_x = int(float(outputSize[0]) * outTex.x);\r\n  int out_y = int(float(outputSize[1]) * outTex.y);\r\n\r\n  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  if (index != -1) {\r\n    int rowIndex = int(floor(float(index) / float(inputCols)));\r\n    int colIndex = int(mod(float(index), float(inputCols)));\r\n    int fragmentIndex = int(floor(float(rowIndex) / float(inputSize[1])));\r\n    rowIndex = int(mod(float(rowIndex), float(inputSize[1])));\r\n    colIndex = fragmentIndex * inputCols + colIndex;\r\n    float val = texelFetch(x, ivec2(colIndex, rowIndex), 0).r;\r\n    outColor = vec4(val);\r\n  } else {\r\n    outColor = vec4(0.0);\r\n  }\r\n}\r\n";
const matMulProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D A;\r\nuniform sampler2D B;\r\nuniform sampler2D C;\r\nuniform bool addC;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 A_size = textureSize(A, 0);\r\n  ivec2 B_size = textureSize(B, 0);\r\n  int out_x = int(float(B_size[0]) * outTex.x);\r\n  int out_y = int(float(A_size[1]) * outTex.y);\r\n  int commonDim = A_size[0];\r\n\r\n  float sum = 0.;\r\n  for (int i = 0; i < commonDim; ++i) {\r\n    float a = texelFetch(A, ivec2(i, out_y), 0).r;\r\n    float b = texelFetch(B, ivec2(out_x, i), 0).r;\r\n    sum += a * b;\r\n  }\r\n\r\n  if (addC) {\r\n    sum += texelFetch(C, ivec2(out_x, 0), 0).r;\r\n  }\r\n\r\n  outColor = vec4(sum);\r\n}\r\n";

class Conv3D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Conv3D';
    const {
      filters = 1,
      kernel_size = [1, 1, 1],
      strides = [1, 1, 1],
      padding = 'valid',
      data_format = 'channels_last',
      dilation_rate = [1, 1, 1],
      activation = 'linear',
      use_bias = true
    } = attrs;

    if (Array.isArray(kernel_size)) {
      this.kernelShape = [filters, ...kernel_size];
    } else {
      this.kernelShape = [filters, kernel_size, kernel_size, kernel_size];
    }

    if (Array.isArray(strides)) {
      this.strides = strides;
    } else {
      this.strides = [strides, strides, strides];
    }

    if (padding === 'valid' || padding === 'same') {
      this.padding = padding;
    } else {
      this.throwError('Invalid padding.');
    }

    if (data_format === 'channels_last' || data_format === 'channels_first') {
      this.dataFormat = data_format;
    } else {
      this.throwError('Only channels_last and channels_first data formats are allowed.');
    }

    if (Array.isArray(dilation_rate)) {
      this.dilationRate = dilation_rate;
    } else {
      this.dilationRate = [dilation_rate, dilation_rate, dilation_rate];
    }

    if ((this.dilationRate[0] !== 1 || this.dilationRate[1] !== 1 || this.dilationRate[2] !== 1) && (this.strides[0] !== 1 || this.strides[1] !== 1 || this.strides[2] !== 1)) {
      this.throwError('Incompatible combination of dilation_rate with strides.');
    }

    this.activation = activation;
    this.activationFunc = activations[activation];
    this.useBias = use_bias;
    this.params = this.useBias ? ['kernel', 'bias'] : ['kernel'];

    if (this.gpu) {
      this.mapInputProgram = _WebGL.webgl2.compileProgram(mapInputProgramSource);
      this.mapInputFragmentsProgram = _WebGL.webgl2.compileProgram(mapInputFragmentsProgramSource);
      this.matMulProgram = _WebGL.webgl2.compileProgram(matMulProgramSource);
      this.activationProgram = _WebGL.webgl2.compileProgram(activationProgramSources[this.activation]);
    }
  }

  setWeights(weightsArr) {
    if (this.dataFormat === 'channels_first') {
      weightsArr[0].tensor = weightsArr[0].tensor.transpose(2, 3, 4, 1, 0);
    }

    super.setWeights(weightsArr, false);

    this._w2row();

    if (this.gpu) {
      this.weights['kernel'] = this.wRowsMat;
      this.weights['kernel'].createGLTexture({
        type: '2d',
        format: 'float'
      });

      if (this.useBias) {
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

  _calcOutputShape(inputShape) {
    if (this.outputShape && this.inputPadding) {
      return;
    }

    const inputDim1 = inputShape[0];
    const inputDim2 = inputShape[1];
    const inputDim3 = inputShape[2];
    const [nbFilter, kernelDim1, kernelDim2, kernelDim3] = this.kernelShape;
    const kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1);
    const kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1);
    const kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1);
    const outputDim1 = this.padding === 'same' ? Math.floor((inputDim1 + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputDim1 - kernelDim1Dilated + this.strides[0]) / this.strides[0]);
    const outputDim2 = this.padding === 'same' ? Math.floor((inputDim2 + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputDim2 - kernelDim2Dilated + this.strides[1]) / this.strides[1]);
    const outputDim3 = this.padding === 'same' ? Math.floor((inputDim3 + this.strides[2] - 1) / this.strides[2]) : Math.floor((inputDim3 - kernelDim3Dilated + this.strides[2]) / this.strides[2]);
    const outputChannels = nbFilter;
    const paddingDim1 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim1 - 1) * this.strides[0] + kernelDim1Dilated - inputDim1)) : 0;
    const paddingDim2 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim2 - 1) * this.strides[1] + kernelDim2Dilated - inputDim2)) : 0;
    const paddingDim3 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim3 - 1) * this.strides[2] + kernelDim3Dilated - inputDim3)) : 0;
    const paddingDim1Before = Math.floor(paddingDim1 / 2);
    const paddingDim1After = paddingDim1 - paddingDim1Before;
    const paddingDim2Before = Math.floor(paddingDim2 / 2);
    const paddingDim2After = paddingDim2 - paddingDim2Before;
    const paddingDim3Before = Math.floor(paddingDim3 / 2);
    const paddingDim3After = paddingDim3 - paddingDim3Before;
    this.outputShape = [outputDim1, outputDim2, outputDim3, outputChannels];
    this.inputPadding = [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After];
  }

  _padInput(x, padValue = 0) {
    if (this.padding === 'same') {
      const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape;
      const [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After] = this.inputPadding;
      const newDim1 = inputDim1 + paddingDim1Before + paddingDim1After;
      const newDim2 = inputDim2 + paddingDim2Before + paddingDim2After;
      const newDim3 = inputDim3 + paddingDim3Before + paddingDim3After;

      const _x = new _Tensor.default([], [newDim1, newDim2, newDim3, inputChannels]);

      if (padValue !== 0) {
        _ndarrayOps.default.assigns(_x.tensor, padValue);
      }

      _ndarrayOps.default.assign(_x.tensor.hi(inputDim1 + paddingDim1Before, inputDim2 + paddingDim2Before, inputDim3 + paddingDim3Before, inputChannels).lo(paddingDim1Before, paddingDim2Before, paddingDim3Before, 0), x.tensor);

      return _x;
    }

    return x;
  }

  _vol2col(x) {
    const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape;
    const kernelDim1 = this.kernelShape[1];
    const kernelDim2 = this.kernelShape[2];
    const kernelDim3 = this.kernelShape[3];
    const outputDim1 = this.outputShape[0];
    const outputDim2 = this.outputShape[1];
    const outputDim3 = this.outputShape[2];
    const nbPatches = outputDim1 * outputDim2 * outputDim3;
    const patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels;
    const kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1);
    const kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1);
    const kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1);

    if (!this.volColsMat) {
      this.volColsMat = new _Tensor.default([], [nbPatches, patchLen]);
    }

    if (kernelDim1Dilated === 1 && kernelDim2Dilated === 1 && kernelDim3Dilated === 1 && this.strides[0] === 1 && this.strides[1] === 1 && this.strides[2] === 1) {
      this.volColsMat.replaceTensorData(x.tensor.data);
      return this.volColsMat;
    }

    const patch = new _Tensor.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
    let offset = 0;

    for (let i = 0, limit = inputDim1 - kernelDim1Dilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputDim2 - kernelDim2Dilated; j <= limit; j += this.strides[1]) {
        for (let k = 0, limit = inputDim3 - kernelDim3Dilated; k <= limit; k += this.strides[2]) {
          _ndarrayOps.default.assign(patch.tensor, x.tensor.hi(i + kernelDim1Dilated, j + kernelDim2Dilated, k + kernelDim3Dilated, inputChannels).lo(i, j, k, 0).step(this.dilationRate[0], this.dilationRate[1], this.dilationRate[2], 1));

          this.volColsMat.tensor.data.set(patch.tensor.data, offset);
          offset += patchLen;
        }
      }
    }

    return this.volColsMat;
  }

  _w2row() {
    const inputChannels = this.weights['kernel'].tensor.shape[3];
    const [nbFilter, kernelDim1, kernelDim2, kernelDim3] = this.kernelShape;
    const patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels;
    this.wRowsMat = new _Tensor.default([], [patchLen, nbFilter]);
    const patch = new _Tensor.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
    const patchRaveled = new _Tensor.default([], [patchLen]);

    for (let n = 0; n < nbFilter; n++) {
      _ndarrayOps.default.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, null, null, n));

      patchRaveled.replaceTensorData(patch.tensor.data);

      _ndarrayOps.default.assign(this.wRowsMat.tensor.pick(null, n), patchRaveled.tensor);
    }

    return this.wRowsMat;
  }

  _callCPU(x) {
    this.inputShape = x.tensor.shape;

    this._calcOutputShape(this.inputShape);

    x = this._padInput(x);

    this._vol2col(x);

    const nbFilter = this.kernelShape[0];
    const outputDim1 = this.outputShape[0];
    const outputDim2 = this.outputShape[1];
    const outputDim3 = this.outputShape[2];
    const nbPatches = outputDim1 * outputDim2 * outputDim3;
    const matMul = new _Tensor.default([], [nbPatches, nbFilter]);

    if (this.useBias) {
      for (let n = 0; n < nbFilter; n++) {
        _ndarrayOps.default.assigns(matMul.tensor.pick(null, n), this.weights['bias'].tensor.get(n));
      }
    }

    (0, _ndarrayGemm.default)(matMul.tensor, this.volColsMat.tensor, this.wRowsMat.tensor, 1, 1);
    this.output = new _Tensor.default([], this.outputShape);
    let outputChannelRaveled = new _Tensor.default([], [outputDim1 * outputDim2 * outputDim3]);
    let outputChannel = new _Tensor.default([], [outputDim1, outputDim2, outputDim3]);

    for (let n = 0; n < nbFilter; n++) {
      _ndarrayOps.default.assign(outputChannelRaveled.tensor, matMul.tensor.pick(null, n));

      outputChannel.replaceTensorData(outputChannelRaveled.tensor.data);

      _ndarrayOps.default.assign(this.output.tensor.pick(null, null, null, n), outputChannel.tensor);
    }

    this.activationFunc(this.output);

    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2);
    }
  }

  _createIndexMap(indicesForReshaped) {
    if (this.indexMap) {
      return;
    }

    let [inputDim1, inputDim2, inputDim3, inputChannels] = this.inputShape;
    let indices = new _Tensor.default(indicesForReshaped.data, indicesForReshaped.shape, {
      type: Int32Array
    });

    if (this.padding === 'same') {
      const [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After] = this.inputPadding;
      inputDim1 = inputDim1 + paddingDim1Before + paddingDim1After;
      inputDim2 = inputDim2 + paddingDim2Before + paddingDim2After;
      inputDim3 = inputDim3 + paddingDim3Before + paddingDim3After;
      const padValue = -1;
      indices = this._padInput(indices, padValue);
    }

    const kernelDim1 = this.kernelShape[1];
    const kernelDim2 = this.kernelShape[2];
    const kernelDim3 = this.kernelShape[3];
    const outputDim1 = this.outputShape[0];
    const outputDim2 = this.outputShape[1];
    const outputDim3 = this.outputShape[2];
    const nbPatches = outputDim1 * outputDim2 * outputDim3;
    const patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels;
    const kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1);
    const kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1);
    const kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1);
    this.indexMap = new _Tensor.default([], [nbPatches, patchLen], {
      type: Int32Array
    });
    const indicesPatch = new _Tensor.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
    let offset = 0;

    for (let i = 0, limit = inputDim1 - kernelDim1Dilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputDim2 - kernelDim2Dilated; j <= limit; j += this.strides[1]) {
        for (let k = 0, limit = inputDim3 - kernelDim3Dilated; k <= limit; k += this.strides[2]) {
          _ndarrayOps.default.assign(indicesPatch.tensor, indices.tensor.hi(i + kernelDim1Dilated, j + kernelDim2Dilated, k + kernelDim3Dilated, inputChannels).lo(i, j, k, 0).step(this.dilationRate[0], this.dilationRate[1], this.dilationRate[2], 1));

          this.indexMap.tensor.data.set(indicesPatch.tensor.data, offset);
          offset += patchLen;
        }
      }
    }

    this.indexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    let outputTextureShape;

    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape;

      this._calcOutputShape(this.inputShape);

      this._createIndexMap(x.indicesForReshaped);

      outputTextureShape = [this.indexMap.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
    } else {
      this.inputShape = x.tensor.shape;

      this._calcOutputShape(this.inputShape);

      x = this._padInput(x);

      this._vol2col(x);

      this.volColsMat.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
      outputTextureShape = [this.volColsMat.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
    }

    if (this.activation !== 'linear' && !this.outputPreactiv) {
      this.outputPreactiv = new _Tensor.default([], outputTextureShape);
      this.outputPreactiv.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
      this.outputPreactiv.is2DReshaped = true;
      this.outputPreactiv.originalShape = this.outputShape;
      this.outputPreactiv.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1);
    }

    if (!this.output) {
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

    if (x.is2DReshaped || x.is2DSquareReshaped) {
      const hasFragments = Boolean(x.glTextureFragments);

      if (hasFragments) {
        x.convert2DRowFragmentedGLTextureToColStack();
      }

      if (!this.convProgram) {
        const convProgramSource = (0, _createGLSLProgram.default)('conv2d', this.output.glTextureFragmentShape ? this.output.glTextureFragmentShape : this.output.glTextureShape, x.glTextureFragmentShape ? x.glTextureFragmentShape : x.glTextureShape, this.indexMap.glTextureFragmentShape ? this.indexMap.glTextureFragmentShape : this.indexMap.glTextureShape, this.useBias, hasFragments);
        this.convProgram = _WebGL.webgl2.compileProgram(convProgramSource);
      }

      _WebGL.webgl2.runProgram({
        program: this.convProgram,
        output: this.activation === 'linear' ? this.output : this.outputPreactiv,
        inputs: [{
          input: x,
          name: 'x'
        }, {
          input: this.indexMap,
          name: 'indexMap'
        }, {
          input: this.weights['kernel'],
          name: 'kernel'
        }, ...(this.useBias ? [{
          input: this.weights['bias'],
          name: 'bias'
        }] : [])],
        supportsTextureFragments: true
      });

      if (hasFragments) {
        x.removeGLTextureFragmentsAsColStack();
      }
    } else {
      const matMulInputs = [{
        input: this.volColsMat,
        name: 'A'
      }, {
        input: this.weights['kernel'],
        name: 'B'
      }];

      if (this.useBias) {
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
          value: this.useBias ? 1 : 0,
          type: 'bool',
          name: 'addC'
        }],
        supportsTextureFragments: true
      });
    }

    if (this.activation !== 'linear') {
      _WebGL.webgl2.runProgram({
        program: this.activationProgram,
        output: this.output,
        inputs: [{
          input: this.outputPreactiv,
          name: 'x'
        }],
        supportsTextureFragments: true
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

exports.default = Conv3D;