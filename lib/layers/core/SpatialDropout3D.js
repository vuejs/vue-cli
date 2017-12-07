"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SpatialDropout3D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'SpatialDropout3D';
    const {
      rate = 0.5,
      data_format = 'channels_last'
    } = attrs;
    this.rate = Math.min(Math.max(0, rate), 1);
    this.dataFormat = data_format;
  }

  call(x) {
    this.output = x;
    return this.output;
  }

}

exports.default = SpatialDropout3D;