"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Merge2 = _interopRequireDefault(require("./_Merge"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayGemm = _interopRequireDefault(require("ndarray-gemm"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mergeProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D input1;\r\nuniform sampler2D input2;\r\nuniform int rows;\r\nuniform int cols;\r\nuniform int dotAxis1;\r\nuniform int dotAxis2;\r\nuniform int commonDim;\r\nuniform bool normalize;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  int out_x = int(float(cols) * outTex.x);\r\n  int out_y = int(float(rows) * outTex.y);\r\n\r\n  float sum = 0.;\r\n  float a = 0.;\r\n  float b = 0.;\r\n  float norm1 = 0.;\r\n  float norm2 = 0.;\r\n\r\n  for (int i = 0; i < commonDim; ++i) {\r\n    if (dotAxis1 == 0 && dotAxis2 == 0) {\r\n      a = texelFetch(input1, ivec2(out_y, i), 0).r;\r\n      b = texelFetch(input2, ivec2(out_x, i), 0).r;\r\n    } else if (dotAxis1 == 1 && dotAxis2 == 1) {\r\n      a = texelFetch(input1, ivec2(i, out_y), 0).r;\r\n      b = texelFetch(input2, ivec2(i, out_x), 0).r;\r\n    }\r\n\r\n    sum += a * b;\r\n\r\n    if (normalize) {\r\n      norm1 += a * a;\r\n      norm2 += b * b;\r\n    }\r\n  }\r\n\r\n  if (normalize) {\r\n    sum /= sqrt(norm1) * sqrt(norm2);\r\n  }\r\n\r\n  outColor = vec4(sum);\r\n}\r\n";

class Dot extends _Merge2.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Dot';
    this.mode = 'dot';
    const {
      axes = -1,
      normalize = false
    } = attrs;

    if (Array.isArray(axes)) {
      this.dotAxes = [axes[0] <= 0 ? axes[0] : axes[0] - 1, axes[1] <= 0 ? axes[1] : axes[1] - 1];
    } else {
      this.dotAxes = [axes <= 0 ? axes : axes - 1, axes <= 0 ? axes : axes - 1];
    }

    this.normalize = normalize;

    if (this.gpu) {
      this.mergeProgram = _WebGL.webgl2.compileProgram(mergeProgramSource);
    }
  }

  _calcOutputShape(inputShapes) {
    let shape1 = inputShapes[0].slice();
    let shape2 = inputShapes[1].slice();
    shape1.splice(this.dotAxes[0], 1);
    shape2.splice(this.dotAxes[1], 1);
    this.outputShape = shape1.concat(shape2);

    if (this.outputShape.length === 1) {
      this.outputShape.push(1);
    }
  }

  _callCPU(inputs) {
    this._calcOutputShape([inputs[0].tensor.shape, inputs[1].tensor.shape]);

    this.output = new _Tensor.default([], this.outputShape);

    if (inputs[0].tensor.shape.length === 2 && inputs[1].tensor.shape.length === 2) {
      if (this.dotAxes[0] === 0 && this.dotAxes[1] === 0) {
        if (this.normalize) {
          for (let i = 0; i < inputs[0].tensor.shape[1]; i++) {
            _ndarrayOps.default.divseq(inputs[0].tensor.pick(null, i), _ndarrayOps.default.norm2(inputs[0].tensor.pick(null, i)));
          }

          for (let i = 0; i < inputs[1].tensor.shape[1]; i++) {
            _ndarrayOps.default.divseq(inputs[1].tensor.pick(null, i), _ndarrayOps.default.norm2(inputs[1].tensor.pick(null, i)));
          }
        }

        (0, _ndarrayGemm.default)(this.output.tensor, inputs[0].tensor.transpose(1, 0), inputs[1].tensor);
      } else if (this.dotAxes[0] === 1 && this.dotAxes[1] === 1) {
        if (this.normalize) {
          for (let i = 0; i < inputs[0].tensor.shape[0]; i++) {
            _ndarrayOps.default.divseq(inputs[0].tensor.pick(i, null), _ndarrayOps.default.norm2(inputs[0].tensor.pick(i, null)));
          }

          for (let i = 0; i < inputs[1].tensor.shape[0]; i++) {
            _ndarrayOps.default.divseq(inputs[1].tensor.pick(i, null), _ndarrayOps.default.norm2(inputs[1].tensor.pick(i, null)));
          }
        }

        (0, _ndarrayGemm.default)(this.output.tensor, inputs[0].tensor, inputs[1].tensor.transpose(1, 0));
      }
    } else {
      this.throwError('dot mode for 3+ dim tensors not yet implemented.');
    }
  }

  _callGPU(inputs) {
    inputs.forEach(input => {
      if (!input.glTexture && !input.glTextureFragments) {
        input.createGLTexture({
          type: '2d',
          format: 'float'
        });
      }
    });

    this._calcOutputShape([inputs[0].glTextureShape, inputs[1].glTextureShape]);

    if (!this.output) {
      this.output = new _Tensor.default([], this.outputShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const commonDim = inputs[0].glTextureShape[this.dotAxes[0]];

    _WebGL.webgl2.runProgram({
      program: this.mergeProgram,
      output: this.output,
      inputs: [{
        input: inputs[0],
        name: 'input1'
      }, {
        input: inputs[1],
        name: 'input2'
      }],
      uniforms: [{
        value: this.output.glTextureShape[0],
        type: 'int',
        name: 'rows'
      }, {
        value: this.output.glTextureShape[1],
        type: 'int',
        name: 'cols'
      }, {
        value: this.dotAxes[0],
        type: 'int',
        name: 'dotAxis1'
      }, {
        value: this.dotAxes[1],
        type: 'int',
        name: 'dotAxis2'
      }, {
        value: commonDim,
        type: 'int',
        name: 'commonDim'
      }, {
        value: +this.normalize,
        type: 'bool',
        name: 'normalize'
      }]
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = Dot;