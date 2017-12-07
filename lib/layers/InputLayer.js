"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isEqual2 = _interopRequireDefault(require("lodash/isEqual"));

var _Layer = _interopRequireDefault(require("../Layer"));

var _Tensor = _interopRequireDefault(require("../Tensor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class InputLayer extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'InputLayer';
    const {
      shape = []
    } = attrs;
    this.shape = attrs.batch_input_shape && attrs.batch_input_shape.length ? attrs.batch_input_shape.slice(1) : shape;
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
    this.inputShape = x.tensor.shape;

    if (!(0, _isEqual2.default)(this.inputShape, this.shape)) {
      this.throwError(`input tensor shape ${x.tensor.shape} does not match specified shape ${this.shape}.`);
    }

    this.output = new _Tensor.default(x.tensor.data, x.tensor.shape);
  }

  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      this.inputShape = x.tensor.shape;
    } else {
      if (x.is2DReshaped || x.is2DSquareReshaped) {
        this.inputShape = x.originalShape;
      } else {
        this.inputShape = x.tensor.shape;
      }
    }

    if (!(0, _isEqual2.default)(this.inputShape, this.shape)) {
      this.throwError(`input tensor shape ${x.tensor.shape} does not match specified shape ${this.shape}.`);
    }

    if (!x.glTexture) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({
          type: '2d',
          format: 'float',
          supportsTextureFragments: true
        });
      } else if (x.tensor.shape.length > 2) {
        x.reshapeTo2D();
        x.createGLTexture({
          type: '2d',
          format: 'float',
          supportsTextureFragments: true
        });
      }
    }

    this.output = x;
  }

}

exports.default = InputLayer;