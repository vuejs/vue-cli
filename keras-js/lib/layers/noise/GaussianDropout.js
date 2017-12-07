"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GaussianDropout extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'GaussianDropout';
    const {
      rate = 0.5
    } = attrs;
    this.rate = Math.min(Math.max(0, rate), 1);
  }

  call(x) {
    this.output = x;
    return this.output;
  }

}

exports.default = GaussianDropout;