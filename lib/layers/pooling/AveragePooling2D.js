"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pooling2D2 = _interopRequireDefault(require("./_Pooling2D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AveragePooling2D extends _Pooling2D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'AveragePooling2D';
    this.poolingFunc = 'average';
  }

}

exports.default = AveragePooling2D;