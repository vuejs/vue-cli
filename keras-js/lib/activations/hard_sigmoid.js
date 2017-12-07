"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hard_sigmoid;

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _hard_sigmoid = (0, _cwise.default)({
  args: ['array'],
  body: function (_x) {
    _x = _x * 0.2 + 0.5;

    if (_x <= 0) {
      _x = 0;
    } else if (_x >= 1) {
      _x = 1;
    }
  }
});

function hard_sigmoid(x) {
  _hard_sigmoid(x.tensor);
}