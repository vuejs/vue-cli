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

class Cropping1D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Cropping1D';
    const {
      cropping = [0, 0]
    } = attrs;

    if (Array.isArray(cropping)) {
      this.cropping = cropping;
    } else {
      this.cropping = [cropping, cropping];
    }

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
    this.inputShape = x.tensor.shape;
    this.outputShape = [this.inputShape[0] - this.cropping[0] - this.cropping[1], this.inputShape[1]];
    this.output = new _Tensor.default([], this.outputShape);

    _ndarrayOps.default.assign(this.output.tensor, x.tensor.hi(this.inputShape[0] - this.cropping[1], this.inputShape[2]).lo(this.cropping[0], 0));
  }

  _createIndexMap() {
    if (this.indexMap) {
      return;
    }

    const indices = new _Tensor.default([], this.inputShape, {
      type: Int32Array
    });
    const indicesRow = new _Tensor.default([], this.inputShape, {
      type: Int32Array
    });
    const indicesCol = new _Tensor.default([], this.inputShape, {
      type: Int32Array
    });

    for (let i = 0; i < this.inputShape[0]; i++) {
      _ndarrayOps.default.assigns(indicesRow.tensor.pick(i, null), i);
    }

    for (let j = 0; j < this.inputShape[1]; j++) {
      _ndarrayOps.default.assigns(indicesCol.tensor.pick(null, j), j);
    }

    _ndarrayOps.default.muls(indices.tensor, indicesRow.tensor, this.inputShape[1]);

    _ndarrayOps.default.addeq(indices.tensor, indicesCol.tensor);

    this.indexMap = new _Tensor.default([], this.outputShape, {
      type: Int32Array
    });
    const sliceStart = [this.cropping[0], 0];
    const sliceEnd = [this.inputShape[0] - this.cropping[1], this.inputShape[2]];

    _ndarrayOps.default.assign(this.indexMap.tensor, indices.tensor.hi(...sliceEnd).lo(...sliceStart));

    this.indexMap.createGLTexture({
      type: '2d',
      format: 'int'
    });
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    this.inputShape = x.tensor.shape;
    this.outputShape = [this.inputShape[0] - this.cropping[0] - this.cropping[1], this.inputShape[1]];

    this._createIndexMap();

    if (!this.output) {
      this.output = new _Tensor.default([], this.outputShape);
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
    }
  }

}

exports.default = Cropping1D;