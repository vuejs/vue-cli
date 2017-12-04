"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createGLSLProgram;

var _add = _interopRequireDefault(require("./merge/add"));

var _average = _interopRequireDefault(require("./merge/average"));

var _concatenate = _interopRequireDefault(require("./merge/concatenate"));

var _maximum = _interopRequireDefault(require("./merge/maximum"));

var _minimum = _interopRequireDefault(require("./merge/minimum"));

var _multiply = _interopRequireDefault(require("./merge/multiply"));

var _subtract = _interopRequireDefault(require("./merge/subtract"));

var _conv2d = _interopRequireDefault(require("./convolutional/conv2d"));

var _conv2dTranspose = _interopRequireDefault(require("./convolutional/conv2dTranspose"));

var _cam = _interopRequireDefault(require("./visualizations/cam"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createGLSLProgram(program, ...args) {
  switch (program) {
    case 'add':
      return (0, _add.default)(...args);

    case 'average':
      return (0, _average.default)(...args);

    case 'concatenate':
      return (0, _concatenate.default)(...args);

    case 'maximum':
      return (0, _maximum.default)(...args);

    case 'minimum':
      return (0, _minimum.default)(...args);

    case 'multiply':
      return (0, _multiply.default)(...args);

    case 'subtract':
      return (0, _subtract.default)(...args);

    case 'conv2d':
      return (0, _conv2d.default)(...args);

    case 'conv2dTranspose':
      return (0, _conv2dTranspose.default)(...args);

    case 'cam':
      return (0, _cam.default)(...args);

    default:
      throw new Error('GLSL program not found');
  }
}