"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = softmax;

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function softmax(x) {
  if (x.tensor.shape.length === 1) {
    const maxval = _ndarrayOps.default.sup(x.tensor);

    _ndarrayOps.default.subseq(x.tensor, maxval);

    _ndarrayOps.default.expeq(x.tensor);

    const sum = _ndarrayOps.default.sum(x.tensor);

    _ndarrayOps.default.divseq(x.tensor, sum);
  } else if (x.tensor.shape.length === 2) {
    for (let i = 0; i < x.tensor.shape[0]; i++) {
      const maxval = _ndarrayOps.default.sup(x.tensor.pick(i, null));

      _ndarrayOps.default.subseq(x.tensor.pick(i, null), maxval);

      _ndarrayOps.default.expeq(x.tensor.pick(i, null));

      const sum = _ndarrayOps.default.sum(x.tensor.pick(i, null));

      _ndarrayOps.default.divseq(x.tensor.pick(i, null), sum);
    }
  } else {
    throw new Error(`[activations.softmax] tensor shape ${x.tensor.shape} not supported.`);
  }
}