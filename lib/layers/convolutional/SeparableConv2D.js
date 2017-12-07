"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var activations = _interopRequireWildcard(require("../../activations"));

var _WebGL = require("../../WebGL2");

var tensorUtils = _interopRequireWildcard(require("../../utils/tensorUtils"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _ndarrayGemm = _interopRequireDefault(require("ndarray-gemm"));

var _Conv2D = _interopRequireDefault(require("./Conv2D"));

var activationProgramSources = _interopRequireWildcard(require("../../activations/programSources"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class _DepthwiseConv2D extends _Conv2D.default {
  constructor(attrs = {}) {
    super(attrs);
  }

  _calcOutputShape(inputShape) {
    super._calcOutputShape(inputShape);

    const nbFilter = this.kernelShape[0];
    const inputChannels = inputShape[2];
    this.outputShape[2] = nbFilter * inputChannels;
  }

  _im2col(x) {
    const [inputRows, inputCols, inputChannels] = x.tensor.shape;
    const nbRow = this.kernelShape[1];
    const nbCol = this.kernelShape[2];
    const outputRows = this.outputShape[0];
    const outputCols = this.outputShape[1];
    const nbPatches = outputRows * outputCols;
    const patchLen = nbRow * nbCol;

    if (!this.imColsMat) {
      this.imColsMat = new _Tensor.default([], [nbPatches * inputChannels, patchLen]);
    }

    let patch = new _Tensor.default([], [nbRow, nbCol, 1]);
    let offset = 0;

    for (let c = 0; c < inputChannels; c++) {
      for (let i = 0, limit = inputRows - nbRow; i <= limit; i += this.strides[0]) {
        for (let j = 0, limit = inputCols - nbCol; j <= limit; j += this.strides[1]) {
          _ndarrayOps.default.assign(patch.tensor, x.tensor.hi(i + nbRow, j + nbCol, c + 1).lo(i, j, c));

          this.imColsMat.tensor.data.set(patch.tensor.data, offset);
          offset += patchLen;
        }
      }
    }

    return this.imColsMat;
  }

  _w2row() {
    const inputChannels = this.weights['kernel'].tensor.shape[2];
    const [nbFilter, nbRow, nbCol] = this.kernelShape;
    const patchLen = nbRow * nbCol;
    this.wRowsMat = new _Tensor.default([], [patchLen, nbFilter * inputChannels]);
    let patch = new _Tensor.default([], [nbRow, nbCol]);
    let patchRaveled = new _Tensor.default([], [patchLen]);
    let p = 0;

    for (let c = 0; c < inputChannels; c++) {
      for (let n = 0; n < nbFilter; n++) {
        _ndarrayOps.default.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, c, n));

        patchRaveled.replaceTensorData(patch.tensor.data);

        _ndarrayOps.default.assign(this.wRowsMat.tensor.pick(null, p), patchRaveled.tensor);

        p += 1;
      }
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
    const inputChannels = this.inputShape[2];
    const matMul = new _Tensor.default([], [nbPatches * inputChannels, nbFilter * inputChannels]);
    (0, _ndarrayGemm.default)(matMul.tensor, this.imColsMat.tensor, this.wRowsMat.tensor, 1, 1);
    this.output = new _Tensor.default([], this.outputShape);
    const outputDataLength = outputRows * outputCols * nbFilter * inputChannels;
    let dataFiltered = new Float32Array(outputDataLength);

    for (let c = 0; c < inputChannels; c++) {
      for (let n = c * outputDataLength + c * nbFilter; n < (c + 1) * outputDataLength; n += nbFilter * inputChannels) {
        for (let m = 0; m < nbFilter; m++) {
          dataFiltered[n + m - c * outputDataLength] = matMul.tensor.data[n + m];
        }
      }
    }

    this.output.replaceTensorData(dataFiltered);
  }

  _createOutputReshapeIndexMap() {
    if (this.reshapeIndexMap) {
      return;
    }

    const nbFilter = this.kernelShape[0];
    const reshape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]];
    const reshapeRowIndices = new _Tensor.default([], reshape, {
      type: Int32Array
    });
    const reshapeColIndices = new _Tensor.default([], reshape, {
      type: Int32Array
    });
    this.reshapeIndexMap = new _Tensor.default([], reshape, {
      type: Int32Array
    });

    for (let j = 0; j < reshape[1]; j++) {
      for (let i = 0; i < reshape[0]; i++) {
        _ndarrayOps.default.assigns(reshapeRowIndices.tensor.pick(i, j), i + Math.floor(j / nbFilter) * reshape[0]);
      }
    }

    for (let j = 0; j < reshape[1]; j++) {
      _ndarrayOps.default.assigns(reshapeColIndices.tensor.pick(null, j), j);
    }

    _ndarrayOps.default.muls(this.reshapeIndexMap.tensor, reshapeRowIndices.tensor, reshape[1]);

    _ndarrayOps.default.addeq(this.reshapeIndexMap.tensor, reshapeColIndices.tensor);

    this.reshapeIndexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    super._callGPU(x);

    this._createOutputReshapeIndexMap();

    if (!this.outputReshaped) {
      const reshape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]];
      this.outputReshaped = new _Tensor.default([], reshape);
      this.outputReshaped.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
      this.outputReshaped.is2DReshaped = true;
      this.outputReshaped.originalShape = this.outputShape;
      this.outputReshaped.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1);
    }

    if (this.output.glTextureFragments) {
      this.output.convert2DRowFragmentedGLTextureToColStack();
    }

    _WebGL.webgl2.runProgram({
      program: this.output.glTextureFragments ? this.mapInputFragmentsProgram : this.mapInputProgram,
      output: this.outputReshaped,
      inputs: [{
        input: this.output,
        name: 'x'
      }, {
        input: this.reshapeIndexMap,
        name: 'indexMap'
      }],
      uniforms: [{
        value: this.output.glTextureShape[1],
        type: 'int',
        name: 'inputCols'
      }],
      supportsTextureFragments: true
    });

    if (this.output.glTextureFragments) {
      this.output.removeGLTextureFragmentsAsColStack();
    }
  }

}

class SeparableConv2D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'SeparableConv2D';
    const {
      filters = 1,
      kernel_size = [1, 1],
      strides = [1, 1],
      padding = 'valid',
      data_format = 'channels_last',
      depth_multiplier = 1,
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

    if (padding === 'valid' || padding === 'same') {
      this.padding = padding;
    } else {
      this.throwError('Invalid padding.');
    }

    this.useBias = use_bias;
    this.params = this.useBias ? ['depthwise_kernel', 'pointwise_kernel', 'bias'] : ['depthwise_kernel', 'pointwise_kernel'];
    this.depthwiseConvAttrs = {
      filters: depth_multiplier,
      kernel_size: [this.kernelShape[1], this.kernelShape[2]],
      strides: this.strides,
      padding,
      data_format,
      activation: 'linear',
      use_bias: false,
      gpu: attrs.gpu
    };
    this.pointwiseConvAttrs = {
      filters,
      kernel_size: [1, 1],
      strides: [1, 1],
      padding,
      data_format,
      activation: 'linear',
      use_bias,
      gpu: attrs.gpu
    };

    if (this.gpu) {
      this.activationProgram = _WebGL.webgl2.compileProgram(activationProgramSources[this.activation]);
    }
  }

  setWeights(weightsArr) {
    this._depthwiseConv = new _DepthwiseConv2D(this.depthwiseConvAttrs);

    this._depthwiseConv.setWeights(weightsArr.slice(0, 1));

    this._pointwiseConv = new _Conv2D.default(this.pointwiseConvAttrs);

    this._pointwiseConv.setWeights(weightsArr.slice(1, 3));
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
    this._depthwiseConv._callCPU(x);

    this._pointwiseConv._callCPU(this._depthwiseConv.output);

    this.output = this._pointwiseConv.output;
    this.activationFunc(this.output);
  }

  _callGPU(x) {
    this._depthwiseConv.outbound = [null];
    this._pointwiseConv.outbound = [null];

    this._depthwiseConv._callGPU(x);

    this._pointwiseConv._callGPU(this._depthwiseConv.outputReshaped);

    if (this.activation === 'linear') {
      this.output = this._pointwiseConv.output;
    } else {
      if (!this.output) {
        this.output = new _Tensor.default([], this._pointwiseConv.output.glTextureShape);
        this.output.createGLTexture({
          type: '2d',
          format: 'float',
          supportsTextureFragments: true
        });
        this.output.is2DReshaped = true;
        this.output.originalShape = this._pointwiseConv.output.originalShape;
        this.output.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this._pointwiseConv.output.originalShape, false, -1);
      }

      this.outputPreactiv = this._pointwiseConv.output;

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

exports.default = SeparableConv2D;