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

const poolingProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform int channelDataSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(x, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  if (isMaxPooling) {\r\n    // GlobalMaxPooling\r\n    float maxval = 0.0;\r\n    for (int j = 0; j < size[1]; ++j) {\r\n      float val = texelFetch(x, ivec2(out_x, j), 0).r;\r\n      if (j == 0 || val > maxval) {\r\n        maxval = val;\r\n      }\r\n    }\r\n    outColor = vec4(maxval);\r\n  } else {\r\n    // GlobalAveragePooling\r\n    float sum = 0.0;\r\n    for (int j = 0; j < size[1]; ++j) {\r\n      float val = texelFetch(x, ivec2(out_x, j), 0).r;\r\n      sum += val;\r\n    }\r\n    outColor = vec4(sum / float(channelDataSize));\r\n  }\r\n}\r\n";

class _GlobalPooling1D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = '_GlobalPooling1D';
    const {
      data_format = 'channels_last'
    } = attrs;
    this.dataFormat = data_format;
    this.poolingFunc = 'max';

    if (this.gpu) {
      this.poolingProgram = _WebGL.webgl2.compileProgram(poolingProgramSource);
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
    const [steps, features] = x.tensor.shape;
    this.output = new _Tensor.default([], [features]);

    for (let i = 0, len = features; i < len; i++) {
      if (this.poolingFunc === 'max') {
        this.output.tensor.set(i, _ndarrayOps.default.sup(x.tensor.pick(null, i)));
      } else if (this.poolingFunc === 'average') {
        this.output.tensor.set(i, _ndarrayOps.default.sum(x.tensor.pick(null, i)) / steps);
      }
    }
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    this.inputShape = x.tensor.shape;

    if (!this.output) {
      this.output = new _Tensor.default([], [this.inputShape[1]]);
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const isMaxPooling = this.poolingFunc === 'max';

    _WebGL.webgl2.runProgram({
      program: this.poolingProgram,
      output: this.output,
      inputs: [{
        input: x,
        name: 'x'
      }],
      uniforms: [{
        value: this.inputShape[0],
        type: 'int',
        name: 'channelDataSize'
      }, {
        value: +isMaxPooling,
        type: 'bool',
        name: 'isMaxPooling'
      }]
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = _GlobalPooling1D;