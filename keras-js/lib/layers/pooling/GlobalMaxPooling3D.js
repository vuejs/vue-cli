"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GlobalPooling3D2 = _interopRequireDefault(require("./_GlobalPooling3D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GlobalMaxPooling3D extends _GlobalPooling3D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'GlobalMaxPooling3D';
    this.poolingFunc = 'max';
  }

}

exports.default = GlobalMaxPooling3D;