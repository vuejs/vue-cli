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

const programSource = "#version 300 es\r\nprecision highp float;\r\nprecision highp isampler2D;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D X;\r\nuniform isampler2D normAxisIndexMap;\r\nuniform sampler2D gamma;\r\nuniform sampler2D beta;\r\nuniform sampler2D mean;\r\nuniform sampler2D std;\r\nuniform float epsilon;\r\nuniform bool scale;\r\nuniform bool center;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(X, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\nint normAxisIndex = texelFetch(normAxisIndexMap, ivec2(out_x, out_y), 0).r;\r\n\r\n  float _x = texelFetch(X, ivec2(out_x, out_y), 0).r;\r\n  float _mean = texelFetch(mean, ivec2(normAxisIndex, 0), 0).r;\r\n  float _std = texelFetch(std, ivec2(normAxisIndex, 0), 0).r;\r\n\r\n  float _gamma = 1.0;\r\n  if (scale) {\r\n    _gamma = texelFetch(gamma, ivec2(normAxisIndex, 0), 0).r;\r\n  }\r\n\r\n  float _beta = 0.0;\r\n  if (center) {\r\n    _beta = texelFetch(beta, ivec2(normAxisIndex, 0), 0).r;\r\n  }\r\n\r\n  float sum = _beta + _gamma * (_x - _mean) / sqrt(_std + epsilon);\r\n\r\n  outColor = vec4(sum);\r\n}\r\n";

class BatchNormalization extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'BatchNormalization';
    const {
      epsilon = 0.001,
      axis = -1,
      center = true,
      scale = true
    } = attrs;
    this.epsilon = epsilon;
    this.center = center;
    this.scale = scale;
    this.axis = axis;
    this.axisNormalized = false;
    this.params = [];

    if (this.scale) {
      this.params.push('gamma');
    }

    if (this.center) {
      this.params.push('beta');
    }

    this.params = this.params.concat(['moving_mean', 'moving_variance']);

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
    if (!this.axisNormalized) {
      this.axis = this.axis < 0 ? x.tensor.shape.length + this.axis : this.axis - 1;
      this.axisNormalized = true;
    }

    let broadcast = [];

    for (let d = 0; d < x.tensor.shape.length; d++) {
      if (d === this.axis) broadcast.push(1);else broadcast.push(null);
    }

    let _gamma = new _Tensor.default([], x.tensor.shape);

    let _beta = new _Tensor.default([], x.tensor.shape);

    for (let i = 0; i < x.tensor.shape[this.axis]; i++) {
      broadcast[this.axis] = i;

      if (this.scale) {
        _ndarrayOps.default.assigns(_gamma.tensor.pick(...broadcast), this.weights['gamma'].tensor.get(i));
      }

      if (this.center) {
        _ndarrayOps.default.assigns(_beta.tensor.pick(...broadcast), this.weights['beta'].tensor.get(i));
      }
    }

    let _mean = new _Tensor.default([], x.tensor.shape);

    let _std = new _Tensor.default([], x.tensor.shape);

    for (let i = 0; i < x.tensor.shape[this.axis]; i++) {
      broadcast[this.axis] = i;

      _ndarrayOps.default.assigns(_mean.tensor.pick(...broadcast), this.weights['moving_mean'].tensor.get(i));

      _ndarrayOps.default.assigns(_std.tensor.pick(...broadcast), this.weights['moving_variance'].tensor.get(i) + this.epsilon);
    }

    _ndarrayOps.default.sqrteq(_std.tensor);

    this.output = new _Tensor.default(x.tensor.data, x.tensor.shape);

    _ndarrayOps.default.subeq(this.output.tensor, _mean.tensor);

    _ndarrayOps.default.diveq(this.output.tensor, _std.tensor);

    if (this.scale) {
      _ndarrayOps.default.muleq(this.output.tensor, _gamma.tensor);
    }

    if (this.center) {
      _ndarrayOps.default.addeq(this.output.tensor, _beta.tensor);
    }
  }

  _createIndexMap(glTextureShape, indicesForReshaped) {
    if (this.normAxisIndexMap) {
      return;
    }

    const _normAxisIndexMap = new _Tensor.default([], this.inputShape, {
      type: Int32Array
    });

    this.normAxisIndexMap = new _Tensor.default([], glTextureShape, {
      type: Int32Array
    });
    const slice = Array(this.inputShape.length).fill(null);

    for (let i = 0; i < this.inputShape[this.axis]; i++) {
      slice[this.axis] = i;

      _ndarrayOps.default.assigns(_normAxisIndexMap.tensor.pick(...slice), i);
    }

    if (indicesForReshaped) {
      for (let i = 0; i < indicesForReshaped.data.length; i++) {
        this.normAxisIndexMap.tensor.data[indicesForReshaped.data[i]] = _normAxisIndexMap.tensor.data[i];
      }
    } else {
      this.normAxisIndexMap = _normAxisIndexMap;
    }

    this.normAxisIndexMap.createGLTexture({
      type: '2d',
      format: 'int',
      supportsTextureFragments: true
    });
  }

  _callGPU(x) {
    if (!this.axisNormalized) {
      if (x.is2DReshaped || x.is2DSquareReshaped) {
        this.inputShape = x.originalShape;
      } else {
        this.inputShape = x.tensor.shape;
      }

      this.axis = this.axis < 0 ? this.inputShape.length + this.axis : this.axis - 1;
      this.axisNormalized = true;
    }

    if (!x.glTexture && !x.glTextureFragments) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({
          type: '2d',
          format: 'float',
          supportsTextureFragments: true
        });
      } else if (x.tensor.shape.length > 2 && !x.is2DReshaped) {
        x.reshapeTo2DSquare();
        x.createGLTexture({
          type: '2d',
          format: 'float',
          supportsTextureFragments: true
        });
      }
    }

    this._createIndexMap(x.glTextureShape, x.indicesForReshaped);

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

    const programInputs = [{
      input: x,
      name: 'X'
    }, {
      input: this.normAxisIndexMap,
      name: 'normAxisIndexMap'
    }];

    if (this.scale) {
      programInputs.push({
        input: this.weights['gamma'],
        name: 'gamma'
      });
    }

    if (this.center) {
      programInputs.push({
        input: this.weights['beta'],
        name: 'beta'
      });
    }

    programInputs.push({
      input: this.weights['moving_mean'],
      name: 'mean'
    });
    programInputs.push({
      input: this.weights['moving_variance'],
      name: 'std'
    });
    const programUniforms = [{
      value: this.epsilon,
      type: 'float',
      name: 'epsilon'
    }, {
      value: +this.scale,
      type: 'bool',
      name: 'scale'
    }, {
      value: +this.center,
      type: 'bool',
      name: 'center'
    }];

    _WebGL.webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: programInputs,
      uniforms: programUniforms,
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

exports.default = BatchNormalization;