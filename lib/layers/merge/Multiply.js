"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Merge2 = _interopRequireDefault(require("./_Merge"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _createGLSLProgram = _interopRequireDefault(require("../../webgl/dynamic/createGLSLProgram"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Multiply extends _Merge2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Multiply';
    this.mode = 'mul';
  }

  _callCPU(inputs) {
    const outputShape = inputs[0].tensor.shape.slice();
    this.output = new _Tensor.default([], outputShape);

    _ndarrayOps.default.assigns(this.output.tensor, 1);

    for (let i = 0; i < inputs.length; i++) {
      _ndarrayOps.default.muleq(this.output.tensor, inputs[i].tensor);
    }
  }

  _callGPU(inputs) {
    if (!this.mergeProgram) {
      const shape = inputs[0].glTextureFragments ? inputs[0].glTextureFragmentShape : inputs[0].glTextureShape;
      const mergeProgramSource = (0, _createGLSLProgram.default)('multiply', inputs.length, shape);
      this.mergeProgram = _WebGL.webgl2.compileProgram(mergeProgramSource);
    }

    super._callGPU(inputs);
  }

}

exports.default = Multiply;