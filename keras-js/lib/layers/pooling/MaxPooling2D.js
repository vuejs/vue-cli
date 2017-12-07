"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pooling2D2 = _interopRequireDefault(require("./_Pooling2D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MaxPooling2D extends _Pooling2D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'MaxPooling2D';
    this.poolingFunc = 'max';
  }

}

exports.default = MaxPooling2D;