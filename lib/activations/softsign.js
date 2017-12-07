"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = softsign;

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _softsign = (0, _cwise.default)({
  args: ['array'],
  body: function (_x) {
    _x /= 1 + Math.abs(_x);
  }
});

function softsign(x) {
  _softsign(x.tensor);
}