"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = relu;

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _Tensor = _interopRequireDefault(require("../Tensor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function relu(x, opts = {}) {
  const {
    alpha = 0,
    maxValue = null
  } = opts;
  let neg;

  if (alpha !== 0) {
    neg = new _Tensor.default([], x.tensor.shape);

    _ndarrayOps.default.mins(neg.tensor, x.tensor, 0);

    _ndarrayOps.default.mulseq(neg.tensor, alpha);
  }

  _ndarrayOps.default.maxseq(x.tensor, 0);

  if (maxValue) {
    _ndarrayOps.default.minseq(x.tensor, maxValue);
  }

  if (neg) {
    _ndarrayOps.default.addeq(x.tensor, neg.tensor);
  }
}