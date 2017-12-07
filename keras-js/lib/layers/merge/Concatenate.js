"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sum2 = _interopRequireDefault(require("lodash/sum"));

var _Merge2 = _interopRequireDefault(require("./_Merge"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _createGLSLProgram = _interopRequireDefault(require("../../webgl/dynamic/createGLSLProgram"));

var tensorUtils = _interopRequireWildcard(require("../../utils/tensorUtils"));

var _ndarrayConcatRows = _interopRequireDefault(require("ndarray-concat-rows"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Concatenate extends _Merge2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Concatenate';
    this.mode = 'concat';
    const {
      axis = -1
    } = attrs;
    this.concatAxis = axis <= 0 ? axis : axis - 1;
  }

  _callCPU(inputs) {
    const outputShape = inputs[0].tensor.shape.slice();

    const _concatAxis = this.concatAxis < 0 ? outputShape.length + this.concatAxis : this.concatAxis;

    inputs.slice(1, inputs.length).forEach(x => {
      const d = x.tensor.shape.slice()[_concatAxis];

      outputShape[_concatAxis] += d;
    });
    this.output = new _Tensor.default([], outputShape);

    if (_concatAxis === 0) {
      (0, _ndarrayConcatRows.default)(this.output.tensor, inputs.map(x => x.tensor));
    } else {
      let dimsAxisSwap = [_concatAxis];

      for (let i = 0; i < inputs[0].tensor.shape.length; i++) {
        if (i !== _concatAxis) dimsAxisSwap.push(i);
      }

      (0, _ndarrayConcatRows.default)(this.output.tensor.transpose(...dimsAxisSwap), inputs.map(x => x.tensor.transpose(...dimsAxisSwap)));
    }
  }

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
    const outputShape = inputs[0].glTextureShape.slice();
    let _concatAxis = 1;

    if (inputs[0].is2DReshaped) {
      if (this.concatAxis === -1 || this.concatAxis === inputs[0].originalShape.length - 1) {
        _concatAxis = 1;
      } else {
        this.throwError('specified axis not supported for now.');
      }
    } else {
      if (this.concatAxis === -1 || this.concatAxis === 1) {
        _concatAxis = 1;
      } else if (this.concatAxis === -2 || this.concatAxis === 0) {
        _concatAxis = 0;
      } else {
        this.throwError('specified axis not supported for now.');
      }
    }

    outputShape[_concatAxis] = (0, _sum2.default)(inputs.map(input => input.glTextureShape[_concatAxis]));

    if (!this.output) {
      this.output = new _Tensor.default([], outputShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: _concatAxis === 1
      });

      if (inputs[0].is1D) {
        this.output.is1D = inputs[0].is1D;
      } else if (inputs[0].is2DReshaped) {
        this.output.is2DReshaped = inputs[0].is2DReshaped;
        this.output.originalShape = inputs[0].originalShape.slice();

        const _concatAxis = this.concatAxis < 0 ? this.output.originalShape.length + this.concatAxis : this.concatAxis;

        this.output.originalShape[_concatAxis] = (0, _sum2.default)(inputs.map(input => input.originalShape[_concatAxis]));
        this.output.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.output.originalShape, false, _concatAxis);
      }
    }

    if (!this.mergeProgram) {
      const outputShape = this.output.glTextureFragments ? this.output.glTextureFragmentShape : this.output.glTextureShape;
      const mergeProgramSource = (0, _createGLSLProgram.default)('concatenate', inputs.length, inputs.map(input => input.glTextureShape), outputShape, _concatAxis);
      this.mergeProgram = _WebGL.webgl2.compileProgram(mergeProgramSource);
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

exports.default = Concatenate;