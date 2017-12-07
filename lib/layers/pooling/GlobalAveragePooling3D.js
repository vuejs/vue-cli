"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GlobalPooling3D2 = _interopRequireDefault(require("./_GlobalPooling3D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GlobalAveragePooling3D extends _GlobalPooling3D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'GlobalAveragePooling3D';
    this.poolingFunc = 'average';
  }

}

exports.default = GlobalAveragePooling3D;