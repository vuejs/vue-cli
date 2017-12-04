"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const flattenProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform int outputSize;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  int out_x = int(float(outputSize) * outTex.x);\r\n  int out_y = 0;\r\n\r\n  int i = int(floor(float(out_x) / float(inputCols)));\r\n  int j = int(mod(float(out_x), float(inputCols)));\r\n  outColor = vec4(texelFetch(x, ivec2(j, i), 0).r);\r\n}\r\n";
const flattenFragmentsProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D x;\r\nuniform int outputSize;\r\nuniform int inputRows;\r\nuniform int inputCols;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  int out_x = int(float(outputSize) * outTex.x);\r\n  int out_y = 0;\r\n\r\n  int rowIndex = int(mod(floor(float(out_x) / float(inputCols)), float(inputRows)));\r\n  int colIndex = int(mod(float(out_x), float(inputCols)));\r\n  int fragmentIndex = int(floor(float(out_x) / (float(inputRows) * float(inputCols))));\r\n  colIndex += fragmentIndex * inputCols;\r\n  outColor = vec4(texelFetch(x, ivec2(colIndex, rowIndex), 0).r);\r\n}\r\n";

class Flatten extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Flatten';

    if (this.gpu) {
      this.flattenProgram = _WebGL.webgl2.compileProgram(flattenProgramSource);
      this.flattenFragmentsProgram = _WebGL.webgl2.compileProgram(flattenFragmentsProgramSource);
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
    if (x.tensor.shape.length <= 1) {
      this.output = x;
    } else {
      this.output = new _Tensor.default([], [x.tensor.shape.reduce((a, b) => a * b, 1)]);
      this.output.replaceTensorData(x.tensor.data);
    }
  }

  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
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
    }

    if (!this.output) {
      this.output = new _Tensor.default([], [x.glTextureShape.reduce((a, b) => a * b, 1)]);
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (x.glTextureFragments) {
      x.convert2DRowFragmentedGLTextureToColStack();

      _WebGL.webgl2.runProgram({
        program: this.flattenFragmentsProgram,
        output: this.output,
        inputs: [{
          input: x,
          name: 'x'
        }],
        uniforms: [{
          value: this.output.glTextureShape[1],
          type: 'int',
          name: 'outputSize'
        }, {
          value: x.glTextureShape[0],
          type: 'int',
          name: 'inputRows'
        }, {
          value: x.glTextureShape[1],
          type: 'int',
          name: 'inputCols'
        }],
        supportsTextureFragments: true
      });

      x.removeGLTextureFragmentsAsColStack();
    } else {
      _WebGL.webgl2.runProgram({
        program: this.flattenProgram,
        output: this.output,
        inputs: [{
          input: x,
          name: 'x'
        }],
        uniforms: [{
          value: this.output.glTextureShape[1],
          type: 'int',
          name: 'outputSize'
        }, {
          value: x.glTextureShape[1],
          type: 'int',
          name: 'inputCols'
        }],
        supportsTextureFragments: true
      });
    }

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = Flatten;