"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pooling3D2 = _interopRequireDefault(require("./_Pooling3D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MaxPooling3D extends _Pooling3D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'MaxPooling3D';
    this.poolingFunc = 'max';
  }

}

exports.default = MaxPooling3D;