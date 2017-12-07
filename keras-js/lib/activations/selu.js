"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = selu;

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _selu = (0, _cwise.default)({
  args: ['array', 'scalar'],
  body: function (_x) {
    const alpha = 1.6732632423543772848170429916717;
    const scale = 1.0507009873554804934193349852946;
    _x = scale * (Math.max(_x, 0) + alpha * (Math.exp(Math.min(_x, 0)) - 1));
  }
});

function selu(x) {
  _selu(x.tensor);
}