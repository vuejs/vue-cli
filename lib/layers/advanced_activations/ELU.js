"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _cwise = _interopRequireDefault(require("cwise"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const programSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform float alpha;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  vec4 v = texture(x, vec2(outTex.x, outTex.y));\r\n  outColor = max(v, 0.0) + alpha * (exp(min(v, 0.0)) - 1.0);\r\n}\r\n";

class ELU extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);

    _initialiseProps.call(this);

    this.layerClass = 'ELU';
    const {
      alpha = 1.0
    } = attrs;
    this.alpha = alpha;

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
    this.output = x;

    this._compute(this.output.tensor, this.alpha);
  }

  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      x.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    if (!this.output) {
      this.output = new _Tensor.default([], x.glTextureShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });

      if (x.is1D) {
        this.output.is1D = x.is1D;
      } else if (x.is2DReshaped || x.is2DSquareReshaped) {
        if (x.is2DReshaped) {
          this.output.is2DReshaped = x.is2DReshaped;
        } else if (x.is2DSquareReshaped) {
          this.output.is2DSquareReshaped = x.is2DSquareReshaped;
        }

        this.output.originalShape = x.originalShape;
        this.output.indicesForReshaped = x.indicesForReshaped;
      }
    }

    _WebGL.webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{
        input: x,
        name: 'x'
      }],
      uniforms: [{
        value: this.alpha,
        type: 'float',
        name: 'alpha'
      }],
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

exports.default = ELU;

var _initialiseProps = function () {
  Object.defineProperty(this, "_compute", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: (0, _cwise.default)({
      args: ['array', 'scalar'],
      body: function (_x, alpha) {
        _x = Math.max(_x, 0) + alpha * (Math.exp(Math.min(_x, 0)) - 1);
      }
    })
  });
};