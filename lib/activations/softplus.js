"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = softplus;

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _softplus = (0, _cwise.default)({
  args: ['array'],
  body: function (_x) {
    _x = Math.log(Math.exp(_x) + 1);
  }
});

function softplus(x) {
  _softplus(x.tensor);
}