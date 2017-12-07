"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _range2 = _interopRequireDefault(require("lodash/range"));

var _isEqual2 = _interopRequireDefault(require("lodash/isEqual"));

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class _Merge extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = '_Merge';
    this.isMergeLayer = true;
  }

  call(inputs) {
    if (this.gpu) {
      this._callGPU(inputs);
    } else {
      const valid = this._validateInputs(inputs);

      if (!valid) {
        this.throwError('Invalid inputs to call method.');
      }

      this._callCPU(inputs);
    }

    return this.output;
  }

  _validateInputs(inputs) {
    const shapes = inputs.map(x => x.tensor.shape.slice());

    if (['sum', 'diff', 'mul', 'ave', 'max', 'min'].indexOf(this.mode) > -1) {
      if (!shapes.every(shape => (0, _isEqual2.default)(shape, shapes[0]))) {
        this.throwError(`All input shapes must be the same for mode ${this.mode}.`);
      }
    }

    if (this.mode === 'dot') {
      if (inputs.length !== 2) {
        this.throwError(`Exactly 2 inputs required for mode ${this.mode}.`);
      }

      if (this.dotAxes[0] < 0) {
        this.dotAxes[0] = shapes[0].length + this.dotAxes[0];
      }

      if (this.dotAxes[1] < 0) {
        this.dotAxes[1] = shapes[1].length + this.dotAxes[1];
      }

      if (shapes[0][this.dotAxes[0]] !== shapes[1][this.dotAxes[1]]) {
        this.throwError('Dimensions incompatibility using dot mode.');
      }
    } else if (this.mode === 'concat') {
      let nonConcatShapes = shapes.slice();

      let _concatAxis = this.concatAxis < 0 ? nonConcatShapes[0].length + this.concatAxis : this.concatAxis;

      if (this.concatAxis === 0) _concatAxis = 0;
      (0, _range2.default)(nonConcatShapes.length).forEach(i => {
        nonConcatShapes[i].splice(_concatAxis, 1);
      });

      if (!nonConcatShapes.every(shape => (0, _isEqual2.default)(shape, nonConcatShapes[0]))) {
        this.throwError('In concat mode, all shapes must be the same except along the concat axis.');
      }
    }

    return true;
  }

  _callCPU() {}

  _callGPU(inputs) {
    inputs.forEach(input => {
      if (!input.glTexture && !input.glTextureFragments) {
        input.createGLTexture({
          type: '2d',
          format: 'float',
          supportsTextureFragments: true
        });
      }
    });

    if (!this.output) {
      this.output = new _Tensor.default([], inputs[0].glTextureShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });

      if (inputs[0].is1D) {
        this.output.is1D = inputs[0].is1D;
      } else if (inputs[0].is2DReshaped || inputs[0].is2DSquareReshaped) {
        if (inputs[0].is2DReshaped) {
          this.output.is2DReshaped = inputs[0].is2DReshaped;
        } else if (inputs[0].is2DSquareReshaped) {
          this.output.is2DSquareReshaped = inputs[0].is2DSquareReshaped;
        }

        this.output.originalShape = inputs[0].originalShape.slice();
        this.output.indicesForReshaped = inputs[0].indicesForReshaped;
      }
    }

    _WebGL.webgl2.runProgram({
      program: this.mergeProgram,
      output: this.output,
      inputs: inputs.map((input, i) => ({
        input,
        name: `inputs[${i}]`
      })),
      supportsTextureFragments: true
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();

      if (this.output.is2DReshaped) {
        this.output.reshapeFrom2D();
      } else if (this.output.is2DSquareReshaped) {
        this.output.reshapeFrom2DSquare();
      }
    }
  }

}

exports.default = _Merge;