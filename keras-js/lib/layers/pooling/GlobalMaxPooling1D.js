"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GlobalPooling1D2 = _interopRequireDefault(require("./_GlobalPooling1D"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GlobalMaxPooling1D extends _GlobalPooling1D2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'GlobalMaxPooling1D';
    this.poolingFunc = 'max';
  }

}

exports.default = GlobalMaxPooling1D;