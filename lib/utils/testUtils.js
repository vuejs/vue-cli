"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.approxEquals = approxEquals;

var _isFinite2 = _interopRequireDefault(require("lodash/isFinite"));

var _flattenDeep2 = _interopRequireDefault(require("lodash/flattenDeep"));

var _ndarrayUnpack = _interopRequireDefault(require("ndarray-unpack"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function approxEquals(ndarrayOut, dataExpected, tol = 0.0001) {
  const a = (0, _flattenDeep2.default)((0, _ndarrayUnpack.default)(ndarrayOut));
  const b = dataExpected;

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (!(0, _isFinite2.default)(a[i])) {
      return false;
    }

    if (a[i] < b[i] - tol || a[i] > b[i] + tol) {
      return false;
    }
  }

  return true;
}