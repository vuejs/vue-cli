"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var layers = _interopRequireWildcard(require("../"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const copyTextureProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D source;\r\nout vec4 outColor;\r\n\r\nvoid main(void) {\r\n  outColor = texture(source, vec2(outTex.x, outTex.y));\r\n}\r\n";
const mapInputProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform isampler2D indexMap;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(indexMap, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  if (index != -1) {\r\n    int rowIndex = int(floor(float(index) / float(inputCols)));\r\n    int colIndex = int(mod(float(index), float(inputCols)));\r\n    float val = texelFetch(x, ivec2(colIndex, rowIndex), 0).r;\r\n    outColor = vec4(val);\r\n  } else {\r\n    outColor = vec4(0.0);\r\n  }\r\n}\r\n";
const selectSliceProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform int t;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(x, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n\r\n  outColor = vec4(texelFetch(x, ivec2(out_x, t), 0).r);\r\n}\r\n";
const copySliceOutputProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D outputCopy;\r\nuniform sampler2D sliceOutput;\r\nuniform int t;\r\nuniform int timesteps;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(sliceOutput, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(timesteps) * outTex.y);\r\n\r\n  if (t == out_y) {\r\n    outColor = vec4(texelFetch(sliceOutput, ivec2(out_x, 0), 0).r);\r\n  } else {\r\n    outColor = texelFetch(outputCopy, ivec2(out_x, out_y), 0);\r\n  }\r\n}\r\n";
const mapSliceOutputProgramSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D outputCopy;\r\nuniform sampler2D sliceOutput;\r\nuniform isampler2D indexMap;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(outputCopy, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  int index = texelFetch(indexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  if (index != -1) {\r\n    int rowIndex = int(floor(float(index) / float(textureSize(sliceOutput, 0)[0])));\r\n    int colIndex = int(mod(float(index), float(textureSize(sliceOutput, 0)[0])));\r\n    float val = texelFetch(sliceOutput, ivec2(colIndex, rowIndex), 0).r;\r\n    outColor = vec4(val);\r\n  } else {\r\n    outColor = texelFetch(outputCopy, ivec2(out_x, out_y), 0);\r\n  }\r\n}\r\n";

class TimeDistributed extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'TimeDistributed';
    const {
      layer
    } = attrs;

    if (!layer) {
      this.throwError('wrapped layer is undefined.');
    }

    const wrappedLayerAttrs = Object.assign({}, layer.config, {
      gpu: attrs.gpu
    });
    this.wrappedLayer = new layers[layer.class_name](wrappedLayerAttrs);
    this.wrappedLayer.outbound = [null];

    if (this.gpu) {
      this.copyTextureProgram = _WebGL.webgl2.compileProgram(copyTextureProgramSource);
      this.mapInputProgram = _WebGL.webgl2.compileProgram(mapInputProgramSource);
      this.selectSliceProgram = _WebGL.webgl2.compileProgram(selectSliceProgramSource);
      this.copySliceOutputProgram = _WebGL.webgl2.compileProgram(copySliceOutputProgramSource);
      this.mapSliceOutputProgram = _WebGL.webgl2.compileProgram(mapSliceOutputProgramSource);
    }
  }

  setWeights(weightsArr) {
    this.wrappedLayer.setWeights(weightsArr);
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
    const stepShape = [...x.tensor.shape.slice(1)];
    const step = new _Tensor.default([], stepShape);

    _ndarrayOps.default.assign(step.tensor, x.tensor.pick(0, ...Array(stepShape.length).fill(null)));

    let stepOutput = this.wrappedLayer.call(step);
    const stepOutputShape = stepOutput.tensor.shape.slice();
    this.output = new _Tensor.default([], [x.tensor.shape[0], ...stepOutputShape]);

    _ndarrayOps.default.assign(this.output.tensor.pick(0, ...Array(stepOutputShape.length).fill(null)), stepOutput.tensor);

    for (let i = 1, timesteps = x.tensor.shape[0]; i < timesteps; i++) {
      _ndarrayOps.default.assign(step.tensor, x.tensor.pick(i, ...Array(stepShape.length).fill(null)));

      stepOutput = this.wrappedLayer.call(step);

      _ndarrayOps.default.assign(this.output.tensor.pick(i, ...Array(stepOutputShape.length).fill(null)), stepOutput.tensor);
    }
  }

  _createIndexMap(indicesForReshaped) {
    if (this.indexMaps) {
      return;
    }

    const indices = new _Tensor.default(indicesForReshaped.data, indicesForReshaped.shape, {
      type: Int32Array
    });
    this.indexMaps = [];
    const timesteps = this.inputShape[0];
    const sliceShape = this.inputShape.slice(1);

    for (let t = 0; t < timesteps; t++) {
      const sliceIndices = new _Tensor.default([], sliceShape, {
        type: Int32Array
      });

      _ndarrayOps.default.assign(sliceIndices.tensor, indices.tensor.pick(t, ...Array(sliceShape.length).fill(null)));

      sliceIndices.reshapeTo2DSquare();
      sliceIndices.createGLTexture({
        type: '2d',
        format: 'int'
      });
      this.indexMaps.push(sliceIndices);
    }
  }

  _createOutputIndexMap(indicesForReshaped) {
    if (this.outputIndexMaps) {
      return;
    }

    const outputSliceIndices = new _Tensor.default(indicesForReshaped.data, indicesForReshaped.shape, {
      type: Int32Array
    });
    this.outputIndexMaps = [];
    const timesteps = this.outputShape[0];
    const sliceShape = this.outputShape.slice(1);

    for (let t = 0; t < timesteps; t++) {
      const outputIndices = new _Tensor.default([], this.outputShape, {
        type: Int32Array
      });

      _ndarrayOps.default.assigns(outputIndices.tensor, -1);

      _ndarrayOps.default.assign(outputIndices.tensor.pick(t, ...Array(sliceShape.length).fill(null)), outputSliceIndices.tensor);

      outputIndices.reshapeTo2DSquare();
      outputIndices.createGLTexture({
        type: '2d',
        format: 'int'
      });
      this.outputIndexMaps.push(outputIndices);
    }
  }

  _callGPU(x) {
    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape;
    } else {
      this.inputShape = x.tensor.shape;
    }

    if (!x.glTexture) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({
          type: '2d',
          format: 'float'
        });
      } else if (x.tensor.shape.length > 2 && !x.is2DReshaped) {
        x.reshapeTo2DSquare();
        x.createGLTexture({
          type: '2d',
          format: 'float'
        });
      }
    }

    if (this.inputShape.length > 2) {
      this._createIndexMap(x.indicesForReshaped);
    }

    const timesteps = this.inputShape[0];
    const sliceShape = this.inputShape.slice(1);

    if (!this.slice) {
      this.slice = new _Tensor.default([], sliceShape);

      if (sliceShape.length <= 2) {
        this.slice.createGLTexture({
          type: '2d',
          format: 'float'
        });
      } else {
        this.slice.reshapeTo2DSquare();
        this.slice.createGLTexture({
          type: '2d',
          format: 'float'
        });
      }
    }

    if (this.inputShape.length <= 2) {
      _WebGL.webgl2.runProgram({
        program: this.selectSliceProgram,
        output: this.slice,
        inputs: [{
          input: x,
          name: 'x'
        }],
        uniforms: [{
          value: 0,
          type: 'int',
          name: 't'
        }]
      });
    } else {
      _WebGL.webgl2.runProgram({
        program: this.mapInputProgram,
        output: this.slice,
        inputs: [{
          input: x,
          name: 'x'
        }, {
          input: this.indexMaps[0],
          name: 'indexMap'
        }],
        uniforms: [{
          value: x.glTextureShape[1],
          type: 'int',
          name: 'inputCols'
        }]
      });
    }

    this.wrappedLayer._callGPU(this.slice);

    this.sliceOutput = this.wrappedLayer.output;

    if (!this.output) {
      if (this.inputShape.length <= 2) {
        this.outputShape = [timesteps, this.sliceOutput.glTextureShape[1]];
        this.output = new _Tensor.default([], this.outputShape);
        this.outputCopy = new _Tensor.default([], this.outputShape);
        this.output.createGLTexture({
          type: '2d',
          format: 'float'
        });
        this.outputCopy.createGLTexture({
          type: '2d',
          format: 'float'
        });
      } else {
        this.outputShape = [timesteps, ...this.sliceOutput.originalShape];
        this.output = new _Tensor.default([], this.outputShape);
        this.outputCopy = new _Tensor.default([], this.outputShape);
        this.output.reshapeTo2DSquare();
        this.outputCopy.reshapeTo2DSquare();
        this.output.createGLTexture({
          type: '2d',
          format: 'float'
        });
        this.outputCopy.createGLTexture({
          type: '2d',
          format: 'float'
        });

        this._createOutputIndexMap(this.sliceOutput.indicesForReshaped);
      }
    }

    _WebGL.webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.outputCopy,
      inputs: [{
        input: this.output,
        name: 'source'
      }]
    });

    if (this.inputShape.length <= 2) {
      _WebGL.webgl2.runProgram({
        program: this.copySliceOutputProgram,
        output: this.output,
        inputs: [{
          input: this.outputCopy,
          name: 'outputCopy'
        }, {
          input: this.sliceOutput,
          name: 'sliceOutput'
        }],
        uniforms: [{
          value: 0,
          type: 'int',
          name: 't'
        }, {
          value: timesteps,
          type: 'int',
          name: 'timesteps'
        }]
      });
    } else {
      _WebGL.webgl2.runProgram({
        program: this.mapSliceOutputProgram,
        output: this.output,
        inputs: [{
          input: this.outputCopy,
          name: 'outputCopy'
        }, {
          input: this.sliceOutput,
          name: 'sliceOutput'
        }, {
          input: this.outputIndexMaps[0],
          name: 'indexMap'
        }]
      });
    }

    for (let i = 1; i < timesteps; i++) {
      if (this.inputShape.length <= 2) {
        _WebGL.webgl2.runProgram({
          program: this.selectSliceProgram,
          output: this.slice,
          inputs: [{
            input: x,
            name: 'x'
          }],
          uniforms: [{
            value: i,
            type: 'int',
            name: 't'
          }]
        });
      } else {
        _WebGL.webgl2.runProgram({
          program: this.mapInputProgram,
          output: this.slice,
          inputs: [{
            input: x,
            name: 'x'
          }, {
            input: this.indexMaps[i],
            name: 'indexMap'
          }],
          uniforms: [{
            value: x.glTextureShape[1],
            type: 'int',
            name: 'inputCols'
          }]
        });
      }

      this.wrappedLayer._callGPU(this.slice);

      this.sliceOutput = this.wrappedLayer.output;

      _WebGL.webgl2.runProgram({
        program: this.copyTextureProgram,
        output: this.outputCopy,
        inputs: [{
          input: this.output,
          name: 'source'
        }]
      });

      if (this.inputShape.length <= 2) {
        _WebGL.webgl2.runProgram({
          program: this.copySliceOutputProgram,
          output: this.output,
          inputs: [{
            input: this.outputCopy,
            name: 'outputCopy'
          }, {
            input: this.sliceOutput,
            name: 'sliceOutput'
          }],
          uniforms: [{
            value: i,
            type: 'int',
            name: 't'
          }, {
            value: timesteps,
            type: 'int',
            name: 'timesteps'
          }]
        });
      } else {
        _WebGL.webgl2.runProgram({
          program: this.mapSliceOutputProgram,
          output: this.output,
          inputs: [{
            input: this.outputCopy,
            name: 'outputCopy'
          }, {
            input: this.sliceOutput,
            name: 'sliceOutput'
          }, {
            input: this.outputIndexMaps[i],
            name: 'indexMap'
          }]
        });
      }
    }

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

exports.default = TimeDistributed;