"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const programSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform sampler2D embeddings;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 x_size = textureSize(x, 0);\r\n  ivec2 embeddings_size = textureSize(embeddings, 0);\r\n  int out_x = int(float(embeddings_size[0]) * outTex.x);\r\n  int out_y = int(float(x_size[0]) * outTex.y);\r\n\r\n  int index = int(texelFetch(x, ivec2(out_y, 0), 0).r);\r\n  outColor = texelFetch(embeddings, ivec2(out_x, index), 0);\r\n}\r\n";

class Embedding extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Embedding';
    const {
      input_dim = 1,
      output_dim = 1,
      input_length = 0,
      mask_zero = false
    } = attrs;
    this.inputDim = input_dim;
    this.outputDim = output_dim;
    this.inputLength = input_length;
    this.maskZero = mask_zero;
    this.params = ['embeddings'];

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
    this.output = new _Tensor.default([], [x.tensor.shape[0], this.weights['embeddings'].tensor.shape[1]]);

    for (let i = 0, len = x.tensor.shape[0]; i < len; i++) {
      _ndarrayOps.default.assign(this.output.tensor.pick(i, null), this.weights['embeddings'].tensor.pick(x.tensor.get(i), null));
    }
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.output) {
      this.output = new _Tensor.default([], [x.glTextureShape[1], this.weights['embeddings'].glTextureShape[1]]);
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
      }, {
        input: this.weights['embeddings'],
        name: 'embeddings'
      }]
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = Embedding;