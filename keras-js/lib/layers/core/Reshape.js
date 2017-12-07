"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _last2 = _interopRequireDefault(require("lodash/last"));

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mapInputProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D indexMap;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(indexMap, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  if (index != -1) {\r\n    int rowIndex = int(floor(float(index) / float(inputCols)));\r\n    int colIndex = int(mod(float(index), float(inputCols)));\r\n    float val = texelFetch(x, ivec2(colIndex, rowIndex), 0).r;\r\n    outColor = vec4(val);\r\n  } else {\r\n    outColor = vec4(0.0);\r\n  }\r\n}\r\n";

class Reshape extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Reshape';
    const {
      target_shape = []
    } = attrs;
    this.targetShape = target_shape;

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
    if (this.targetShape.reduce((a, b) => a * b, 1) !== x.tensor.size) {
      this.throwError('The total size of new array must be unchanged in reshape layer.');
    }

    this.output = new _Tensor.default([], this.targetShape);
    this.output.replaceTensorData(x.tensor.data);
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

    if (this.inputShape.length === 2) {
      for (let i = 0; i < this.inputShape[0]; i++) {
        _ndarrayOps.default.assigns(indicesRow.tensor.pick(i, null), i);
      }
    } else if (this.inputShape.length === 3) {
      for (let i = 0; i < this.inputShape[0]; i++) {
        for (let j = 0; j < this.inputShape[1]; j++) {
          _ndarrayOps.default.assigns(indicesRow.tensor.pick(i, j, null), i * this.inputShape[1] + j);
        }
      }
    } else if (this.inputShape.length === 4) {
      for (let i = 0; i < this.inputShape[0]; i++) {
        for (let j = 0; j < this.inputShape[1]; j++) {
          for (let k = 0; k < this.inputShape[2]; k++) {
            _ndarrayOps.default.assigns(indicesRow.tensor.pick(i, j, k, null), i * this.inputShape[1] * this.inputShape[2] + j * this.inputShape[2] + k);
          }
        }
      }
    }

    for (let c = 0; c < (0, _last2.default)(this.inputShape); c++) {
      _ndarrayOps.default.assigns(indicesCol.tensor.pick(...Array(this.inputShape.length - 1).fill(null), c), c);
    }

    _ndarrayOps.default.muls(indices.tensor, indicesRow.tensor, (0, _last2.default)(this.inputShape));

    _ndarrayOps.default.addeq(indices.tensor, indicesCol.tensor);

    this.indexMap = new _Tensor.default([], this.targetShape, {
      type: Int32Array
    });
    this.indexMap.replaceTensorData(new Int32Array(indices.tensor.data));

    if (this.targetShape.length > 2) {
      this.indexMap.reshapeTo2D();
    }

    this.indexMap.createGLTexture({
      type: '2d',
      format: 'int'
    });
  }

  _callGPU(x) {
    if (!x.glTexture) {
      this.inputShape = x.tensor.shape;

      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({
          type: '2d',
          format: 'float'
        });
      } else if (x.tensor.shape.length > 2 && !x.is2DReshaped) {
        x.reshapeTo2D();
        x.createGLTexture({
          type: '2d',
          format: 'float'
        });
      }
    } else if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape;
    } else {
      this.inputShape = x.tensor.shape;
    }

    this._createIndexMap();

    if (!this.output) {
      this.output = new _Tensor.default([], this.targetShape);

      if (this.targetShape.length > 2) {
        this.output.reshapeTo2D();
      }

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

      if (this.output.is2DReshaped) {
        this.output.reshapeFrom2D();
      } else if (this.output.is2DSquareReshaped) {
        this.output.reshapeFrom2DSquare();
      }
    }
  }

}

exports.default = Reshape;