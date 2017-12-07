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

class Conv2D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Conv2D';
    const {
      filters = 1,
      kernel_size = [3, 3],
      strides = [1, 1],
      padding = 'valid',
      data_format = 'channels_last',
      dilation_rate = [1, 1],
      activation = 'linear',
      use_bias = true
    } = attrs;

    if (Array.isArray(kernel_size)) {
      this.kernelShape = [filters, ...kernel_size];
    } else {
      this.kernelShape = [filters, kernel_size, kernel_size];
    }

    if (Array.isArray(strides)) {
      this.strides = strides;
    } else {
      this.strides = [strides, strides];
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
      this.dilationRate = [dilation_rate, dilation_rate];
    }

    if ((this.dilationRate[0] !== 1 || this.dilationRate[1] !== 1) && (this.strides[0] !== 1 || this.strides[1] !== 1)) {
      this.throwError(`Incompatible combination of dilation_rate with strides.`);
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
      weightsArr[0].tensor = weightsArr[0].tensor.transpose(2, 3, 1, 0);
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

    const inputRows = inputShape[0];
    const inputCols = inputShape[1];
    const [nbFilter, nbRow, nbCol] = this.kernelShape;
    const nbRowDilated = nbRow + (nbRow - 1) * (this.dilationRate[0] - 1);
    const nbColDilated = nbCol + (nbCol - 1) * (this.dilationRate[1] - 1);
    const outputRows = this.padding === 'same' ? Math.floor((inputRows + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputRows - nbRowDilated + this.strides[0]) / this.strides[0]);
    const outputCols = this.padding === 'same' ? Math.floor((inputCols + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputCols - nbColDilated + this.strides[1]) / this.strides[1]);
    const outputChannels = nbFilter;
    const paddingRow = this.padding === 'same' ? Math.max(0, Math.floor((outputRows - 1) * this.strides[0] + nbRowDilated - inputRows)) : 0;
    const paddingCol = this.padding === 'same' ? Math.max(0, Math.floor((outputCols - 1) * this.strides[1] + nbColDilated - inputCols)) : 0;
    const paddingRowBefore = Math.floor(paddingRow / 2);
    const paddingRowAfter = paddingRow - paddingRowBefore;
    const paddingColBefore = Math.floor(paddingCol / 2);
    const paddingColAfter = paddingCol - paddingColBefore;
    this.outputShape = [outputRows, outputCols, outputChannels];
    this.inputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter];
  }

  _padInput(x, padValue = 0) {
    if (this.padding === 'same') {
      const [inputRows, inputCols, inputChannels] = x.tensor.shape;
      const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding;
      const newRows = inputRows + paddingRowBefore + paddingRowAfter;
      const newCols = inputCols + paddingColBefore + paddingColAfter;

      const _x = new _Tensor.default([], [newRows, newCols, inputChannels]);

      if (padValue !== 0) {
        _ndarrayOps.default.assigns(_x.tensor, padValue);
      }

      _ndarrayOps.default.assign(_x.tensor.hi(inputRows + paddingRowBefore, inputCols + paddingColBefore, inputChannels).lo(paddingRowBefore, paddingColBefore, 0), x.tensor);

      return _x;
    }

    return x;
  }

  _im2col(x) {
    const [inputRows, inputCols, inputChannels] = x.tensor.shape;
    const nbRow = this.kernelShape[1];
    const nbCol = this.kernelShape[2];
    const outputRows = this.outputShape[0];
    const outputCols = this.outputShape[1];
    const nbPatches = outputRows * outputCols;
    const patchLen = nbRow * nbCol * inputChannels;
    const nbRowDilated = nbRow + (nbRow - 1) * (this.dilationRate[0] - 1);
    const nbColDilated = nbCol + (nbCol - 1) * (this.dilationRate[1] - 1);

    if (!this.imColsMat) {
      this.imColsMat = new _Tensor.default([], [nbPatches, patchLen]);
    }

    if (nbRowDilated === 1 && nbColDilated === 1 && this.strides[0] === 1 && this.strides[1] === 1) {
      this.imColsMat.replaceTensorData(x.tensor.data);
      return this.imColsMat;
    }

    const patch = new _Tensor.default([], [nbRow, nbCol, inputChannels]);
    let offset = 0;

    for (let i = 0, limit = inputRows - nbRowDilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputCols - nbColDilated; j <= limit; j += this.strides[1]) {
        _ndarrayOps.default.assign(patch.tensor, x.tensor.hi(i + nbRowDilated, j + nbColDilated, inputChannels).lo(i, j, 0).step(this.dilationRate[0], this.dilationRate[1], 1));

        this.imColsMat.tensor.data.set(patch.tensor.data, offset);
        offset += patchLen;
      }
    }

    return this.imColsMat;
  }

  _w2row() {
    const inputChannels = this.weights['kernel'].tensor.shape[2];
    const [nbFilter, nbRow, nbCol] = this.kernelShape;
    const patchLen = nbRow * nbCol * inputChannels;
    this.wRowsMat = new _Tensor.default([], [patchLen, nbFilter]);
    const patch = new _Tensor.default([], [nbRow, nbCol, inputChannels]);
    const patchRaveled = new _Tensor.default([], [patchLen]);

    for (let n = 0; n < nbFilter; n++) {
      _ndarrayOps.default.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, null, n));

      patchRaveled.replaceTensorData(patch.tensor.data);

      _ndarrayOps.default.assign(this.wRowsMat.tensor.pick(null, n), patchRaveled.tensor);
    }

    return this.wRowsMat;
  }

  _callCPU(x) {
    this.inputShape = x.tensor.shape;

    this._calcOutputShape(this.inputShape);

    x = this._padInput(x);

    this._im2col(x);

    const nbFilter = this.kernelShape[0];
    const outputRows = this.outputShape[0];
    const outputCols = this.outputShape[1];
    const nbPatches = outputRows * outputCols;
    const matMul = new _Tensor.default([], [nbPatches, nbFilter]);

    if (this.useBias) {
      for (let n = 0; n < nbFilter; n++) {
        _ndarrayOps.default.assigns(matMul.tensor.pick(null, n), this.weights['bias'].tensor.get(n));
      }
    }

    (0, _ndarrayGemm.default)(matMul.tensor, this.imColsMat.tensor, this.wRowsMat.tensor, 1, 1);
    this.output = new _Tensor.default([], this.outputShape);
    let outputChannelRaveled = new _Tensor.default([], [outputRows * outputCols]);
    let outputChannel = new _Tensor.default([], [outputRows, outputCols]);

    for (let n = 0; n < nbFilter; n++) {
      _ndarrayOps.default.assign(outputChannelRaveled.tensor, matMul.tensor.pick(null, n));

      outputChannel.replaceTensorData(outputChannelRaveled.tensor.data);

      _ndarrayOps.default.assign(this.output.tensor.pick(null, null, n), outputChannel.tensor);
    }

    this.activationFunc(this.output);

    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(2, 0, 1);
    }
  }

  _createIndexMap(indicesForReshaped) {
    if (this.indexMap) {
      return;
    }

    let [inputRows, inputCols, inputChannels] = this.inputShape;
    let indices = new _Tensor.default(indicesForReshaped.data, indicesForReshaped.shape, {
      type: Int32Array
    });

    if (this.padding === 'same') {
      const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding;
      inputRows = inputRows + paddingRowBefore + paddingRowAfter;
      inputCols = inputCols + paddingColBefore + paddingColAfter;
      const padValue = -1;
      indices = this._padInput(indices, padValue);
    }

    const nbRow = this.kernelShape[1];
    const nbCol = this.kernelShape[2];
    const outputRows = this.outputShape[0];
    const outputCols = this.outputShape[1];
    const nbPatches = outputRows * outputCols;
    const patchLen = nbRow * nbCol * inputChannels;
    const nbRowDilated = nbRow + (nbRow - 1) * (this.dilationRate[0] - 1);
    const nbColDilated = nbCol + (nbCol - 1) * (this.dilationRate[1] - 1);
    this.indexMap = new _Tensor.default([], [nbPatches, patchLen], {
      type: Int32Array
    });
    const indicesPatch = new _Tensor.default([], [nbRow, nbCol, inputChannels]);
    let offset = 0;

    for (let i = 0, limit = inputRows - nbRowDilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputCols - nbColDilated; j <= limit; j += this.strides[1]) {
        _ndarrayOps.default.assign(indicesPatch.tensor, indices.tensor.hi(i + nbRowDilated, j + nbColDilated, inputChannels).lo(i, j, 0).step(this.dilationRate[0], this.dilationRate[1], 1));

        this.indexMap.tensor.data.set(indicesPatch.tensor.data, offset);
        offset += patchLen;
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

      this._im2col(x);

      this.imColsMat.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
      outputTextureShape = [this.imColsMat.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
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
        input: this.imColsMat,
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
        this.output.tensor = this.output.tensor.transpose(2, 0, 1);
      }
    }
  }

}

exports.default = Conv2D;