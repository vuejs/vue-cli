"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tanh;

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _tanh = (0, _cwise.default)({
  args: ['array'],
  body: function (_x) {
    _x = Math.tanh(_x);
  }
});

function tanh(x) {
  _tanh(x.tensor);
}