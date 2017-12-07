"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _Conv2D = _interopRequireDefault(require("./Conv2D"));

var tensorUtils = _interopRequireWildcard(require("../../utils/tensorUtils"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _ndarraySqueeze = _interopRequireDefault(require("ndarray-squeeze"));

var _ndarrayUnsqueeze = _interopRequireDefault(require("ndarray-unsqueeze"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Conv1D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Conv1D';
    const {
      filters = 1,
      kernel_size = 1,
      strides = 1,
      padding = 'valid',
      dilation_rate = 1,
      activation = 'linear',
      use_bias = true
    } = attrs;

    if (padding !== 'valid' && padding !== 'same') {
      this.throwError('Invalid padding.');
    }

    if (dilation_rate !== 1 && strides !== 1) {
      this.throwError('Incompatible combination of dilation_rate with strides.');
    }

    this.use_bias = use_bias;
    this.params = this.use_bias ? ['kernel', 'bias'] : ['kernel'];
    const conv2dAttrs = {
      filters,
      kernel_size: [kernel_size, 1],
      strides: [strides, 1],
      padding,
      data_format: 'channels_first',
      dilation_rate,
      activation,
      use_bias
    };
    this._conv2dAttrs = conv2dAttrs;
    this._conv2d = new _Conv2D.default(Object.assign(conv2dAttrs, {
      gpu: attrs.gpu
    }));
  }

  setWeights(weightsArr) {
    weightsArr[0].tensor = (0, _ndarrayUnsqueeze.default)(weightsArr[0].tensor).transpose(2, 1, 0, 3);

    this._conv2d.setWeights(weightsArr);
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
    const input = new _Tensor.default(x.tensor.data, x.tensor.shape);
    input.tensor = (0, _ndarrayUnsqueeze.default)(input.tensor).transpose(0, 2, 1);

    const conv2dOutput = this._conv2d.call(input);

    this.outputShape = [0, 2].map(i => this._conv2d.outputShape[i]);
    this.output = new _Tensor.default([], this.outputShape);

    _ndarrayOps.default.assign(this.output.tensor, (0, _ndarraySqueeze.default)(conv2dOutput.tensor).transpose(1, 0, 2));
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const inputShape = x.tensor.shape;
    const input = new _Tensor.default([], inputShape);
    Object.assign(input, x);
    input.glTextureShape = inputShape;
    input.is2DReshaped = true;
    input.originalShape = [inputShape[0], 1, inputShape[1]];
    input.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(input.originalShape, false, -1);
    this.output = this._conv2d.call(input);

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = Conv1D;