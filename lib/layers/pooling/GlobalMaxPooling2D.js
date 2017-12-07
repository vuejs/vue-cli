"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GlobalPooling2D2 = _interopRequireDefault(require("./_GlobalPooling2D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GlobalMaxPooling2D extends _GlobalPooling2D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'GlobalMaxPooling2D';
    this.poolingFunc = 'max';
  }

}

exports.default = GlobalMaxPooling2D;