"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GaussianNoise extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'GaussianNoise';
    const {
      stddev = 0
    } = attrs;
    this.stddev = stddev;
  }

  call(x) {
    this.output = x;
    return this.output;
  }

}

exports.default = GaussianNoise;