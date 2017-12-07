"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pooling1D2 = _interopRequireDefault(require("./_Pooling1D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MaxPooling1D extends _Pooling1D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'MaxPooling1D';
    this.poolingFunc = 'max';
  }

}

exports.default = MaxPooling1D;