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

const mapInputProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D indexMap;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(indexMap, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  if (index != -1) {\r\n    int rowIndex = int(floor(float(index) / float(inputCols)));\r\n    int colIndex = int(mod(float(index), float(inputCols)));\r\n    float val = texelFetch(x, ivec2(colIndex, rowIndex), 0).r;\r\n    outColor = vec4(val);\r\n  } else {\r\n    outColor = vec4(0.0);\r\n  }\r\n}\r\n";

class UpSampling2D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'UpSampling2D';
    const {
      size = [2, 2],
      data_format = 'channels_last'
    } = attrs;

    if (Array.isArray(size)) {
      this.size = size;
    } else {
      this.size = [size, size];
    }

    this.dataFormat = data_format;

    if (this.gpu) {
      this.mapInputProgram = _WebGL.webgl2.compileProgram(mapInputProgramSource);
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
    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(1, 2, 0);
    }

    this.inputShape = x.tensor.shape;
    this.outputShape = [this.inputShape[0] * this.size[0], this.inputShape[1] * this.size[1], this.inputShape[2]];
    this.output = new _Tensor.default([], this.outputShape);

    for (let i = 0; i < this.size[0]; i++) {
      for (let j = 0; j < this.size[1]; j++) {
        _ndarrayOps.default.assign(this.output.tensor.lo(i, j, 0).step(this.size[0], this.size[1], 1), x.tensor);
      }
    }

    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(2, 0, 1);
      this.output.tensor = this.output.tensor.transpose(2, 0, 1);
    }
  }

  _createIndexMap(indicesForReshaped) {
    if (this.indexMap) {
      return;
    }

    const indices = new _Tensor.default(indicesForReshaped.data, indicesForReshaped.shape, {
      type: Int32Array
    });
    this.indexMap = new _Tensor.default([], this.outputShape, {
      type: Int32Array
    });

    for (let i = 0; i < this.size[0]; i++) {
      for (let j = 0; j < this.size[1]; j++) {
        const sliceStart = this.dataFormat === 'channels_first' ? [0, i, j] : [i, j, 0];
        const step = this.dataFormat === 'channels_first' ? [1, this.size[0], this.size[1]] : [this.size[0], this.size[1], 1];

        _ndarrayOps.default.assign(this.indexMap.tensor.lo(...sliceStart).step(...step), indices.tensor);
      }
    }

    this.indexMap.reshapeTo2DSquare();
    this.indexMap.createGLTexture({
      type: '2d',
      format: 'int'
    });
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.reshapeTo2DSquare();
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    this.inputShape = x.originalShape;
    this.outputShape = this.dataFormat === 'channels_first' ? [this.inputShape[0], this.inputShape[1] * this.size[0], this.inputShape[2] * this.size[1]] : [this.inputShape[0] * this.size[0], this.inputShape[1] * this.size[1], this.inputShape[2]];

    this._createIndexMap(x.indicesForReshaped);

    if (!this.output) {
      this.output = new _Tensor.default([], this.outputShape);
      this.output.reshapeTo2DSquare();
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    _WebGL.webgl2.runProgram({
      program: this.mapInputProgram,
      output: this.output,
      inputs: [{
        input: x,
        name: 'x'
      }, {
        input: this.indexMap,
        name: 'indexMap'
      }],
      uniforms: [{
        value: x.glTextureShape[1],
        type: 'int',
        name: 'inputCols'
      }]
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
      this.output.reshapeFrom2DSquare();
    }
  }

}

exports.default = UpSampling2D;