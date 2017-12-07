"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Model", {
  enumerable: true,
  get: function () {
    return _Model.default;
  }
});
Object.defineProperty(exports, "Tensor", {
  enumerable: true,
  get: function () {
    return _Tensor.default;
  }
});
exports.testUtils = exports.layers = exports.activations = exports.GPU_SUPPORT = void 0;

require("@babel/polyfill");

var _Model = _interopRequireDefault(require("./Model"));

var _Tensor = _interopRequireDefault(require("./Tensor"));

var _WebGL = require("./WebGL2");

var activations = _interopRequireWildcard(require("./activations"));

exports.activations = activations;

var layers = _interopRequireWildcard(require("./layers"));

exports.layers = layers;

var testUtils = _interopRequireWildcard(require("./utils/testUtils"));

exports.testUtils = testUtils;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GPU_SUPPORT = _WebGL.webgl2.isSupported;
exports.GPU_SUPPORT = GPU_SUPPORT;