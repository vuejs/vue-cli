"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sigmoid;

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _sigmoid = (0, _cwise.default)({
  args: ['array'],
  body: function (_x) {
    _x = 1 / (1 + Math.exp(-_x));
  }
});

function sigmoid(x) {
  _sigmoid(x.tensor);
}