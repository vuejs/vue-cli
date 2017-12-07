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

var _cwise = _interopRequireDefault(require("cwise"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _ndarrayGemm = _interopRequireDefault(require("ndarray-gemm"));

var activationProgramSources = _interopRequireWildcard(require("../../activations/programSources"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const matMulProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D A;\r\nuniform sampler2D B;\r\nuniform sampler2D C;\r\nuniform bool addC;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 A_size = textureSize(A, 0);\r\n  ivec2 B_size = textureSize(B, 0);\r\n  int out_x = int(float(B_size[0]) * outTex.x);\r\n  int out_y = int(float(A_size[1]) * outTex.y);\r\n  int commonDim = A_size[0];\r\n\r\n  float sum = 0.;\r\n  for (int i = 0; i < commonDim; ++i) {\r\n    float a = texelFetch(A, ivec2(i, out_y), 0).r;\r\n    float b = texelFetch(B, ivec2(out_x, i), 0).r;\r\n    sum += a * b;\r\n  }\r\n\r\n  if (addC) {\r\n    sum += texelFetch(C, ivec2(out_x, 0), 0).r;\r\n  }\r\n\r\n  outColor = vec4(sum);\r\n}\r\n";
const assignToRowIndicesMap = (0, _cwise.default)({
  args: [{
    blockIndices: -1
  }, 'scalar', 'scalar'],
  body: function (x, rowIndex, size) {
    for (let i = 0; i < size; i++) {
      if (x[i] === -1) {
        x[i] = rowIndex;
        break;
      }
    }
  }
});
const assignToColIndicesMap = (0, _cwise.default)({
  args: [{
    blockIndices: -1
  }, 'array', 'scalar'],
  body: function (x, colIndex, size) {
    for (let i = 0; i < size; i++) {
      if (x[i] === -1) {
        x[i] = colIndex;
        break;
      }
    }
  }
});

class Conv2DTranspose extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Conv2DTranspose';
    const {
      filters = 1,
      kernel_size = [3, 3],
      strides = [1, 1],
      padding = 'valid',
      data_format = 'channels_last',
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

    this.activation = activation;
    this.activationFunc = activations[activation];
    this.useBias = use_bias;
    this.params = this.useBias ? ['kernel', 'bias'] : ['kernel'];

    if (this.gpu) {
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
    if (this.outputShape && this.outputPadding) {
      return;
    }

    const inputRows = inputShape[0];
    const inputCols = inputShape[1];
    const [nbFilter, nbRow, nbCol] = this.kernelShape;
    const outputRows = this.padding === 'same' ? inputRows * this.strides[0] : inputRows * this.strides[0] + Math.max(nbRow - this.strides[0], 0);
    const outputCols = this.padding === 'same' ? inputCols * this.strides[1] : inputCols * this.strides[1] + Math.max(nbCol - this.strides[1], 0);
    const outputChannels = nbFilter;
    const paddingRow = this.padding === 'same' ? Math.max(0, Math.floor((inputRows - 1) * this.strides[0] + nbRow - outputRows)) : 0;
    const paddingCol = this.padding === 'same' ? Math.max(0, Math.floor((inputCols - 1) * this.strides[1] + nbCol - outputCols)) : 0;
    const paddingRowBefore = Math.floor(paddingRow / 2);
    const paddingRowAfter = paddingRow - paddingRowBefore;
    const paddingColBefore = Math.floor(paddingCol / 2);
    const paddingColAfter = paddingCol - paddingColBefore;
    this.outputShape = [outputRows, outputCols, outputChannels];
    this.outputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter];
  }

  _im2col(x) {
    const [inputRows, inputCols, inputChannels] = x.tensor.shape;

    if (!this.imColsMat) {
      this.imColsMat = new _Tensor.default([], [inputRows * inputCols, inputChannels]);
    }

    const channelRaveled = new _Tensor.default([], [inputRows * inputCols]);
    const channel = new _Tensor.default([], [inputRows, inputCols]);

    for (let c = 0; c < inputChannels; c++) {
      _ndarrayOps.default.assign(channel.tensor, x.tensor.pick(null, null, c));

      channelRaveled.replaceTensorData(channel.tensor.data);

      _ndarrayOps.default.assign(this.imColsMat.tensor.pick(null, c), channelRaveled.tensor);
    }

    return this.imColsMat;
  }

  _w2row() {
    const [nbRow, nbCol, nbFilter, inputChannels] = this.weights['kernel'].tensor.shape;
    this.wRowsMat = new _Tensor.default([], [inputChannels, nbRow * nbCol * nbFilter]);
    const channelRaveled = new _Tensor.default([], [nbRow * nbCol * nbFilter]);
    const channel = new _Tensor.default([], [nbRow, nbCol, nbFilter]);

    for (let c = 0; c < inputChannels; c++) {
      _ndarrayOps.default.assign(channel.tensor, this.weights['kernel'].tensor.pick(null, null, null, c));

      channelRaveled.replaceTensorData(channel.tensor.data);

      _ndarrayOps.default.assign(this.wRowsMat.tensor.pick(c, null), channelRaveled.tensor);
    }

    return this.wRowsMat;
  }

  _callCPU(x) {
    this.inputShape = x.tensor.shape;

    this._calcOutputShape(this.inputShape);

    this._im2col(x);

    const inputRows = x.tensor.shape[0];
    const inputCols = x.tensor.shape[1];
    const [nbFilter, nbRow, nbCol] = this.kernelShape;
    const matMul = new _Tensor.default([], [inputRows * inputCols, nbRow * nbCol * nbFilter]);
    (0, _ndarrayGemm.default)(matMul.tensor, this.imColsMat.tensor, this.wRowsMat.tensor, 1, 1);
    const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.outputPadding;
    this.output = new _Tensor.default([], this.outputShape);
    let outputPadded = new _Tensor.default([], [this.outputShape[0] + paddingRowBefore + paddingRowAfter, this.outputShape[1] + paddingColBefore + paddingColAfter, this.outputShape[2]]);
    const patchShape = [nbRow, nbCol, nbFilter];
    let patch = new _Tensor.default([], patchShape);
    let patchRaveled = new _Tensor.default([], [nbRow * nbCol * nbFilter]);
    let index = 0;

    for (let i = 0; i < inputRows; i++) {
      for (let j = 0; j < inputCols; j++) {
        _ndarrayOps.default.assign(patchRaveled.tensor, matMul.tensor.pick(index, null));

        patch.replaceTensorData(patchRaveled.tensor.data);
        const iOutPos = i * this.strides[0];
        const jOutPos = j * this.strides[1];

        _ndarrayOps.default.addeq(outputPadded.tensor.hi(iOutPos + nbRow, jOutPos + nbCol, this.outputShape[2]).lo(iOutPos, jOutPos, 0), patch.tensor);

        index += 1;
      }
    }

    _ndarrayOps.default.assign(this.output.tensor, outputPadded.tensor.hi(this.outputShape[0] + paddingRowBefore, this.outputShape[1] + paddingColBefore, this.outputShape[2]).lo(paddingRowBefore, paddingColBefore, 0));

    if (this.useBias) {
      for (let n = 0; n < nbFilter; n++) {
        _ndarrayOps.default.addseq(this.output.tensor.pick(null, null, n), this.weights['bias'].tensor.get(n));
      }
    }

    this.activationFunc(this.output);

    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(2, 0, 1);
    }
  }

  _createIndexMap() {
    if (this.indexMap) {
      return;
    }

    const inputRows = this.inputShape[0];
    const inputCols = this.inputShape[1];
    const [nbFilter, nbRow, nbCol] = this.kernelShape;
    const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.outputPadding;
    const effectiveKernelSize = (nbRow - this.strides[0] + 1) * (nbCol - this.strides[1] + 1);
    const indicesMapShape = [this.outputShape[0], this.outputShape[1], effectiveKernelSize];
    const indicesMapShapePadded = [this.outputShape[0] + paddingRowBefore + paddingRowAfter, this.outputShape[1] + paddingColBefore + paddingColAfter, effectiveKernelSize];
    const outputRowIndicesMap = new _Tensor.default([], indicesMapShape, {
      type: Int32Array
    });
    const outputColIndicesMap = new _Tensor.default([], indicesMapShape, {
      type: Int32Array
    });
    const outputRowIndicesMapPadded = new _Tensor.default([], indicesMapShapePadded, {
      type: Int32Array
    });
    const outputColIndicesMapPadded = new _Tensor.default([], indicesMapShapePadded, {
      type: Int32Array
    });

    _ndarrayOps.default.assigns(outputRowIndicesMap.tensor, -1);

    _ndarrayOps.default.assigns(outputColIndicesMap.tensor, -1);

    _ndarrayOps.default.assigns(outputRowIndicesMapPadded.tensor, -1);

    _ndarrayOps.default.assigns(outputColIndicesMapPadded.tensor, -1);

    const matMulColIndicesPatch = new _Tensor.default([], [nbRow, nbCol, nbFilter], {
      type: Int32Array
    });

    for (let i = 0; i < nbRow * nbCol * nbFilter; i++) {
      matMulColIndicesPatch.tensor.data[i] = i;
    }

    for (let i = 0; i < inputRows; i++) {
      for (let j = 0; j < inputCols; j++) {
        const matMulRowIndex = i * inputCols + j;
        const iOutPos = i * this.strides[0];
        const jOutPos = j * this.strides[1];
        assignToRowIndicesMap(outputRowIndicesMapPadded.tensor.hi(iOutPos + nbRow, jOutPos + nbCol, effectiveKernelSize).lo(iOutPos, jOutPos, 0), matMulRowIndex, effectiveKernelSize);
        assignToColIndicesMap(outputColIndicesMapPadded.tensor.hi(iOutPos + nbRow, jOutPos + nbCol, effectiveKernelSize).lo(iOutPos, jOutPos, 0), matMulColIndicesPatch.tensor.pick(null, null, 0), effectiveKernelSize);
      }
    }

    _ndarrayOps.default.assign(outputRowIndicesMap.tensor, outputRowIndicesMapPadded.tensor.hi(this.outputShape[0] + paddingRowBefore, this.outputShape[1] + paddingColBefore, effectiveKernelSize).lo(paddingRowBefore, paddingColBefore, 0));

    _ndarrayOps.default.assign(outputColIndicesMap.tensor, outputColIndicesMapPadded.tensor.hi(this.outputShape[0] + paddingRowBefore, this.outputShape[1] + paddingColBefore, effectiveKernelSize).lo(paddingRowBefore, paddingColBefore, 0));

    const tiledIndicesMapShape = [this.outputShape[0] * this.outputShape[1], effectiveKernelSize];
    this.indexMap = new _Tensor.default([], tiledIndicesMapShape, {
      type: Int32Array
    });
    const channelData = new _Tensor.default([], [effectiveKernelSize], {
      type: Int32Array
    });

    for (let i = 0; i < this.outputShape[0]; i++) {
      for (let j = 0; j < this.outputShape[1]; j++) {
        for (let k = 0; k < effectiveKernelSize; k++) {
          const rowIndex = outputRowIndicesMap.tensor.get(i, j, k);
          const colIndex = outputColIndicesMap.tensor.get(i, j, k);

          if (rowIndex !== -1 && colIndex !== -1) {
            channelData.tensor.set(k, rowIndex * this.weights['kernel'].glTextureShape[1] + colIndex);
          } else {
            channelData.tensor.set(k, -1);
          }
        }

        _ndarrayOps.default.assign(this.indexMap.tensor.pick(i * this.outputShape[1] + j, null), channelData.tensor);
      }
    }

    this.indexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape;

      this._calcOutputShape(this.inputShape);
    } else {
      this.inputShape = x.tensor.shape;

      this._calcOutputShape(this.inputShape);

      this._im2col(x);

      this.imColsMat.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    const input = x.is2DReshaped || x.is2DSquareReshaped ? x : this.imColsMat;

    if (!this.matMulResult) {
      const outputTextureShape = [input.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
      this.matMulResult = new _Tensor.default([], outputTextureShape);
      this.matMulResult.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    if (this.activation !== 'linear' && !this.outputPreactiv) {
      const outputTextureShape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]];
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
      const outputTextureShape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]];
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

    _WebGL.webgl2.runProgram({
      program: this.matMulProgram,
      output: this.matMulResult,
      inputs: [{
        input: input,
        name: 'A'
      }, {
        input: this.weights['kernel'],
        name: 'B'
      }],
      uniforms: [{
        value: 0,
        type: 'bool',
        name: 'addC'
      }],
      supportsTextureFragments: true
    });

    this._createIndexMap();

    const hasFragments = Boolean(this.matMulResult.glTextureFragments);

    if (hasFragments) {
      this.matMulResult.convert2DRowFragmentedGLTextureToColStack();
    }

    if (!this.convTransposeProgram) {
      const convTransposeProgramSource = (0, _createGLSLProgram.default)('conv2dTranspose', this.output.glTextureFragmentShape ? this.output.glTextureFragmentShape : this.output.glTextureShape, this.matMulResult.glTextureFragmentShape ? this.matMulResult.glTextureFragmentShape : this.matMulResult.glTextureShape, this.indexMap.glTextureFragmentShape ? this.indexMap.glTextureFragmentShape : this.indexMap.glTextureShape, this.useBias, hasFragments);
      this.convTransposeProgram = _WebGL.webgl2.compileProgram(convTransposeProgramSource);
    }

    _WebGL.webgl2.runProgram({
      program: this.convTransposeProgram,
      output: this.activation === 'linear' ? this.output : this.outputPreactiv,
      inputs: [{
        input: this.matMulResult,
        name: 'matMulResult'
      }, {
        input: this.indexMap,
        name: 'indexMap'
      }, ...(this.useBias ? [{
        input: this.weights['bias'],
        name: 'bias'
      }] : [])],
      supportsTextureFragments: true
    });

    if (hasFragments) {
      this.matMulResult.removeGLTextureFragmentsAsColStack();
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

exports.default = Conv2DTranspose;