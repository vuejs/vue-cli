"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var tensorUtils = _interopRequireWildcard(require("../../utils/tensorUtils"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const poolingProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D poolIndexMap;\r\nuniform int channels;\r\nuniform int poolSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  int out_x = int(float(channels) * outTex.x);\r\n  int out_y = int(float(textureSize(poolIndexMap, 0)[1]) * outTex.y);\r\n\r\n  float val = 0.;\r\n  int count = 0;\r\n  for (int i = 0; i < poolSize; ++i) {\r\n    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;\r\n    if (poolIndex != -1) {\r\n      float val2 = texelFetch(x, ivec2(out_x, poolIndex), 0).r;\r\n      if (isMaxPooling) {\r\n        if (count == 0 || val2 > val) {\r\n          val = val2;\r\n        }\r\n      } else {\r\n        val += val2;\r\n      }\r\n      count += 1;\r\n    }\r\n  }\r\n\r\n  if (!isMaxPooling) {\r\n    val /= float(count);\r\n  }\r\n\r\n  outColor = vec4(val);\r\n}\r\n";
const poolingFragmentsProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D poolIndexMap;\r\nuniform int channels;\r\nuniform int poolSize;\r\nuniform bool isMaxPooling;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 inputSize = textureSize(x, 0);\r\n  ivec2 outputSize = textureSize(poolIndexMap, 0);\r\n  int out_x = int(float(channels) * outTex.x);\r\n  int out_y = int(float(outputSize[1]) * outTex.y);\r\n\r\n  float val = 0.;\r\n  int count = 0;\r\n  for (int i = 0; i < poolSize; ++i) {\r\n    int poolIndex = texelFetch(poolIndexMap, ivec2(i, out_y), 0).r;\r\n    int fragmentIndex = int(floor(float(poolIndex) / float(inputSize[1])));\r\n    if (poolIndex != -1) {\r\n      poolIndex = int(mod(float(poolIndex), float(inputSize[1])));\r\n      float val2 = texelFetch(x, ivec2(fragmentIndex * channels + out_x, poolIndex), 0).r;\r\n      if (isMaxPooling) {\r\n        if (count == 0 || val2 > val) {\r\n          val = val2;\r\n        }\r\n      } else {\r\n        val += val2;\r\n      }\r\n      count += 1;\r\n    }\r\n  }\r\n\r\n  if (!isMaxPooling) {\r\n    val /= float(count);\r\n  }\r\n\r\n  outColor = vec4(val);\r\n}\r\n";

class _Pooling2D extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = '_Pooling2D';
    const {
      pool_size = [2, 2],
      strides = null,
      padding = 'valid',
      data_format = 'channels_last'
    } = attrs;

    if (Array.isArray(pool_size)) {
      this.poolSize = pool_size;
    } else {
      this.poolSize = [pool_size, pool_size];
    }

    if (Array.isArray(strides)) {
      this.strides = strides;
    } else if (strides !== null) {
      this.strides = [strides, strides];
    } else {
      this.strides = this.poolSize;
    }

    this.padding = padding;
    this.dataFormat = data_format;
    this.poolingFunc = 'max';

    if (this.gpu) {
      this.poolingProgram = _WebGL.webgl2.compileProgram(poolingProgramSource);
      this.poolingFragmentsProgram = _WebGL.webgl2.compileProgram(poolingFragmentsProgramSource);
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

  _calcOutputShape(inputShape) {
    if (this.outputShape && this.inputPadding) {
      return;
    }

    const [inputRows, inputCols, inputChannels] = inputShape;
    const [nbRow, nbCol] = this.poolSize;
    const outputRows = this.padding === 'same' ? Math.floor((inputRows + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputRows - nbRow + this.strides[0]) / this.strides[0]);
    const outputCols = this.padding === 'same' ? Math.floor((inputCols + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputCols - nbCol + this.strides[1]) / this.strides[1]);
    const paddingRow = this.padding === 'same' ? Math.max(0, Math.floor((outputRows - 1) * this.strides[0] + nbRow - inputRows)) : 0;
    const paddingCol = this.padding === 'same' ? Math.max(0, Math.floor((outputCols - 1) * this.strides[1] + nbCol - inputCols)) : 0;
    const paddingRowBefore = Math.floor(paddingRow / 2);
    const paddingRowAfter = paddingRow - paddingRowBefore;
    const paddingColBefore = Math.floor(paddingCol / 2);
    const paddingColAfter = paddingCol - paddingColBefore;
    this.outputShape = [outputRows, outputCols, inputChannels];
    this.inputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter];
  }

  _padInput(x) {
    if (this.padding === 'same') {
      const [inputRows, inputCols, inputChannels] = x.tensor.shape;
      const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding;
      const newRows = inputRows + paddingRowBefore + paddingRowAfter;
      const newCols = inputCols + paddingColBefore + paddingColAfter;

      const _x = new _Tensor.default([], [newRows, newCols, inputChannels]);

      if (this.poolingFunc === 'max') {
        _ndarrayOps.default.assigns(_x.tensor, Number.NEGATIVE_INFINITY);
      }

      _ndarrayOps.default.assign(_x.tensor.hi(inputRows + paddingRowBefore, inputCols + paddingColBefore, inputChannels).lo(paddingRowBefore, paddingColBefore, 0), x.tensor);

      return _x;
    }

    return x;
  }

  _callCPU(x) {
    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(1, 2, 0);
    }

    this._calcOutputShape(x.tensor.shape);

    x = this._padInput(x);
    const [inputRows, inputCols, inputChannels] = x.tensor.shape;
    const [nbRow, nbCol] = this.poolSize;
    this.output = new _Tensor.default([], this.outputShape);
    const patch = new _Tensor.default([], [nbRow, nbCol, inputChannels]);
    const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding;

    for (let i = 0, _i = 0; i <= inputRows - nbRow; i += this.strides[0], _i++) {
      let nbRowInPadding = 0;

      if (i < paddingRowBefore) {
        nbRowInPadding = paddingRowBefore - i;
      } else if (i + nbRow > inputRows - paddingRowAfter) {
        nbRowInPadding = i + nbRow - (inputRows - paddingRowAfter);
      }

      for (let j = 0, _j = 0; j <= inputCols - nbCol; j += this.strides[1], _j++) {
        let nbColInPadding = 0;

        if (j < paddingColBefore) {
          nbColInPadding = paddingColBefore - j;
        } else if (j + nbCol > inputCols - paddingColAfter) {
          nbColInPadding = j + nbCol - (inputCols - paddingColAfter);
        }

        const nbCellsEffective = (nbRow - nbRowInPadding) * (nbCol - nbColInPadding);

        _ndarrayOps.default.assign(patch.tensor, x.tensor.hi(i + nbRow, j + nbCol, inputChannels).lo(i, j, 0));

        for (let c = 0; c < inputChannels; c++) {
          if (this.poolingFunc === 'max') {
            this.output.tensor.set(_i, _j, c, _ndarrayOps.default.sup(patch.tensor.pick(null, null, c)));
          } else if (this.poolingFunc === 'average') {
            this.output.tensor.set(_i, _j, c, _ndarrayOps.default.sum(patch.tensor.pick(null, null, c)) / nbCellsEffective);
          }
        }
      }
    }

    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(2, 0, 1);
    }
  }

  _im2col(x) {
    const [inputRows, inputCols, inputChannels] = x.tensor.shape;

    if (!this.tiledInput) {
      this.tiledInput = new _Tensor.default([], [inputRows * inputCols, inputChannels]);
    }

    const patch = new _Tensor.default([], [inputRows, inputCols]);
    const patchRaveled = new _Tensor.default([], [inputRows * inputCols]);

    for (let c = 0; c < inputChannels; c++) {
      _ndarrayOps.default.assign(patch.tensor, x.tensor.pick(null, null, c));

      patchRaveled.replaceTensorData(patch.tensor.data);

      _ndarrayOps.default.assign(this.tiledInput.tensor.pick(null, c), patchRaveled.tensor);
    }

    return this.tiledInput;
  }

  _createIndexMap() {
    if (this.poolIndexMap) {
      return;
    }

    let inputRows = this.inputShape[0];
    let inputCols = this.inputShape[1];
    const rowIndices = new _Tensor.default([], [inputRows, inputCols]);
    let index = 0;

    for (let i = 0; i < inputRows; i++) {
      for (let j = 0; j < inputCols; j++) {
        rowIndices.tensor.set(i, j, index);
        index += 1;
      }
    }

    if (this.padding === 'same') {
      const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding;
      inputRows = inputRows + paddingRowBefore + paddingRowAfter;
      inputCols = inputCols + paddingColBefore + paddingColAfter;

      const _rowIndices = new _Tensor.default([], [inputRows, inputCols]);

      _ndarrayOps.default.assigns(_rowIndices.tensor, -1);

      _ndarrayOps.default.assign(_rowIndices.tensor.hi(this.inputShape[0] + paddingRowBefore, this.inputShape[1] + paddingColBefore).lo(paddingRowBefore, paddingColBefore), rowIndices.tensor);

      rowIndices.tensor = _rowIndices.tensor;
    }

    const [nbRow, nbCol] = this.poolSize;
    const outputRows = this.outputShape[0];
    const outputCols = this.outputShape[1];
    this.poolIndexMap = new _Tensor.default([], [outputRows * outputCols, nbRow * nbCol], {
      type: Int32Array
    });
    const patchRow = new _Tensor.default([], [nbRow, nbCol]);
    let offset = 0;

    for (let i = 0, limit = inputRows - nbRow; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputCols - nbCol; j <= limit; j += this.strides[1]) {
        _ndarrayOps.default.assign(patchRow.tensor, rowIndices.tensor.hi(i + nbRow, j + nbCol).lo(i, j));

        this.poolIndexMap.tensor.data.set(patchRow.tensor.data, offset);
        offset += nbRow * nbCol;
      }
    }

    this.poolIndexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape;
    } else {
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 0);
      }

      this.inputShape = x.tensor.shape;

      this._im2col(x);

      this.tiledInput.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
    }

    this._calcOutputShape(this.inputShape);

    this._createIndexMap();

    if (!this.output) {
      const [outputRows, outputCols, inputChannels] = this.outputShape;
      const outputTextureShape = [outputRows * outputCols, inputChannels];
      this.output = new _Tensor.default([], outputTextureShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float',
        supportsTextureFragments: true
      });
      this.output.is2DReshaped = true;
      this.output.originalShape = this.outputShape;
      this.output.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1);
    }

    const input = x.is2DReshaped || x.is2DSquareReshaped ? x : this.tiledInput;
    const poolSize = this.poolSize[0] * this.poolSize[1];
    const isMaxPooling = this.poolingFunc === 'max';
    const programUniforms = [{
      value: this.output.glTextureShape[1],
      type: 'int',
      name: 'channels'
    }, {
      value: poolSize,
      type: 'int',
      name: 'poolSize'
    }, {
      value: +isMaxPooling,
      type: 'bool',
      name: 'isMaxPooling'
    }];

    if (input.glTextureFragments) {
      input.convert2DRowFragmentedGLTextureToColStack();

      _WebGL.webgl2.runProgram({
        program: this.poolingFragmentsProgram,
        output: this.output,
        inputs: [{
          input: input,
          name: 'x'
        }, {
          input: this.poolIndexMap,
          name: 'poolIndexMap'
        }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      });

      input.removeGLTextureFragmentsAsColStack();
    } else {
      _WebGL.webgl2.runProgram({
        program: this.poolingProgram,
        output: this.output,
        inputs: [{
          input: input,
          name: 'x'
        }, {
          input: this.poolIndexMap,
          name: 'poolIndexMap'
        }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      });
    }

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
      this.output.reshapeFrom2D();

      if (this.dataFormat === 'channels_first') {
        this.output.tensor = this.output.tensor.transpose(2, 0, 1);
      }
    }
  }

}

exports.default = _Pooling2D;