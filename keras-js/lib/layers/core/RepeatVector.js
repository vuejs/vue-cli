"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayUnsqueeze = _interopRequireDefault(require("ndarray-unsqueeze"));

var _ndarrayTile = _interopRequireDefault(require("ndarray-tile"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const programSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  outColor = texture(x, vec2(outTex.x, 0));\r\n}\r\n";

class RepeatVector extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'RepeatVector';
    const {
      n = 1
    } = attrs;
    this.n = n;

    if (this.gpu) {
      this.program = _WebGL.webgl2.compileProgram(programSource);
    }
  }

  call(x) {
    if (this.gpu) {
      this._callGPU(x);
    } else {
      this._callCPU(x);
    }

    return this.output;
  }

  _callCPU(x) {
    if (x.tensor.shape.length !== 1) {
      this.throwError('Only 1D tensor inputs allowed.');
    }

    this.output = new _Tensor.default([], [this.n, x.tensor.shape[1]]);
    this.output.tensor = (0, _ndarrayTile.default)((0, _ndarrayUnsqueeze.default)(x.tensor, 0), [this.n, 1]);
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.output) {
      this.output = new _Tensor.default([], [this.n, x.glTextureShape[1]]);
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    _WebGL.webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{
        input: x,
        name: 'x'
      }]
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = RepeatVector;