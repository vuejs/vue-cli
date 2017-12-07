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

class ZeroPadding3D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'ZeroPadding3D';
    const {
      padding = [[1, 1], [1, 1], [1, 1]],
      data_format = 'channels_last'
    } = attrs;

    if (Array.isArray(padding)) {
      if (Array.isArray(padding[0])) {
        this.padding = padding;
      } else {
        this.padding = [[padding[0], padding[0]], [padding[1], padding[1]], [padding[2], padding[2]]];
      }
    } else {
      this.padding = [[padding, padding], [padding, padding], [padding, padding]];
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
      x.tensor = x.tensor.transpose(1, 2, 3, 0);
    }

    this.inputShape = x.tensor.shape;
    this.outputShape = [this.inputShape[0] + this.padding[0][0] + this.padding[0][1], this.inputShape[1] + this.padding[1][0] + this.padding[1][1], this.inputShape[2] + this.padding[2][0] + this.padding[2][1], this.inputShape[3]];
    this.output = new _Tensor.default([], this.outputShape);

    _ndarrayOps.default.assign(this.output.tensor.hi(this.inputShape[0] + this.padding[0][0], this.inputShape[1] + this.padding[1][0], this.inputShape[2] + this.padding[2][0], this.inputShape[3]).lo(this.padding[0][0], this.padding[1][0], this.padding[2][0], 0), x.tensor);

    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(3, 0, 1, 2);
      this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2);
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
    const sliceStart = this.dataFormat === 'channels_first' ? [0, this.padding[0][0], this.padding[1][0], this.padding[2][0]] : [this.padding[0][0], this.padding[1][0], this.padding[2][0], 0];
    const sliceEnd = this.dataFormat === 'channels_first' ? [this.inputShape[0], this.inputShape[1] + this.padding[0][0], this.inputShape[2] + this.padding[1][0], this.inputShape[3] + this.padding[2][0]] : [this.inputShape[0] + this.padding[0][0], this.inputShape[1] + this.padding[1][0], this.inputShape[2] + this.padding[2][0], this.inputShape[3]];

    _ndarrayOps.default.assigns(this.indexMap.tensor, -1);

    _ndarrayOps.default.assign(this.indexMap.tensor.hi(...sliceEnd).lo(...sliceStart), indices.tensor);

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
    this.outputShape = this.dataFormat === 'channels_first' ? [this.inputShape[0], this.inputShape[1] + this.padding[0][0] + this.padding[0][1], this.inputShape[2] + this.padding[1][0] + this.padding[1][1], this.inputShape[3] + this.padding[2][0] + this.padding[2][1]] : [this.inputShape[0] + this.padding[0][0] + this.padding[0][1], this.inputShape[1] + this.padding[1][0] + this.padding[1][1], this.inputShape[2] + this.padding[2][0] + this.padding[2][1], this.inputShape[3]];

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

exports.default = ZeroPadding3D;