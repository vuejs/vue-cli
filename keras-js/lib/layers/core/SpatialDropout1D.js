"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SpatialDropout1D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'SpatialDropout1D';
    const {
      p = 0.5
    } = attrs;
    this.p = Math.min(Math.max(0, p), 1);
  }

  call(x) {
    this.output = x;
    return this.output;
  }

}

exports.default = SpatialDropout1D;