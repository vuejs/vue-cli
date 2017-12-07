"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Layer = _interopRequireDefault(require("../../Layer"));

var _Tensor = _interopRequireDefault(require("../../Tensor"));

var _WebGL = require("../../WebGL2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var recurrentLayers = _interopRequireWildcard(require("../recurrent"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const copyTextureProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D source;\r\nout vec4 outColor;\r\n\r\nvoid main(void) {\r\n  outColor = texture(source, vec2(outTex.x, outTex.y));\r\n}\r\n";
const concatMergeProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D forward;\r\nuniform sampler2D backward;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(forward, 0);\r\n  int out_x = int(float(size[0] * 2) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  if (out_x >= 0 && out_x < size[0]) {\r\n    outColor = vec4(texelFetch(forward, ivec2(out_x, out_y), 0).r);\r\n  } else {\r\n    outColor = vec4(texelFetch(backward, ivec2(out_x - size[0], size[1] - out_y - 1), 0).r);\r\n  }\r\n}\r\n";
const sumMergeProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D forward;\r\nuniform sampler2D backward;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(forward, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float forward_val = texelFetch(forward, ivec2(out_x, out_y), 0).r;\r\n  float backward_val = texelFetch(backward, ivec2(out_x, size[1] - out_y - 1), 0).r;\r\n\r\n  outColor = vec4(forward_val + backward_val);\r\n}\r\n";
const mulMergeProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D forward;\r\nuniform sampler2D backward;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(forward, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float forward_val = texelFetch(forward, ivec2(out_x, out_y), 0).r;\r\n  float backward_val = texelFetch(backward, ivec2(out_x, size[1] - out_y - 1), 0).r;\r\n\r\n  outColor = vec4(forward_val * backward_val);\r\n}\r\n";
const aveMergeProgramSource = "#version 300 es\r\nprecision highp float;\r\n\r\nin vec2 outTex;\r\nuniform sampler2D forward;\r\nuniform sampler2D backward;\r\nout vec4 outColor;\r\n\r\nvoid main() {\r\n  ivec2 size = textureSize(forward, 0);\r\n  int out_x = int(float(size[0]) * outTex.x);\r\n  int out_y = int(float(size[1]) * outTex.y);\r\n\r\n  float forward_val = texelFetch(forward, ivec2(out_x, out_y), 0).r;\r\n  float backward_val = texelFetch(backward, ivec2(out_x, size[1] - out_y - 1), 0).r;\r\n\r\n  outColor = vec4(0.5 * (forward_val + backward_val));\r\n}\r\n";

class Bidirectional extends _Layer.default {
  constructor(attrs = {}) {
    super(attrs);
    this.layerClass = 'Bidirectional';
    const {
      layer,
      merge_mode = 'concat'
    } = attrs;

    if (!layer) {
      this.throwError('wrapped layer is undefined.');
    }

    if (!['SimpleRNN', 'GRU', 'LSTM'].includes(layer.class_name)) {
      this.throwError(`cannot wrap ${layer.class_name} layer.`);
    }

    if (!['concat', 'sum', 'mul', 'ave'].includes(merge_mode)) {
      this.throwError(`merge_mode ${merge_mode} not supported.`);
    }

    const forwardLayerAttrs = Object.assign({}, layer.config, {
      gpu: attrs.gpu
    });
    const backwardLayerAttrs = Object.assign({}, layer.config, {
      gpu: attrs.gpu
    });
    backwardLayerAttrs.go_backwards = !backwardLayerAttrs.go_backwards;
    this.forwardLayer = new recurrentLayers[layer.class_name](forwardLayerAttrs);
    this.backwardLayer = new recurrentLayers[layer.class_name](backwardLayerAttrs);
    this.forwardLayer.outbound = [null];
    this.backwardLayer.outbound = [null];
    this.mergeMode = merge_mode;
    this.returnSequences = layer.config.return_sequences;

    if (this.gpu) {
      this.copyTextureProgram = _WebGL.webgl2.compileProgram(copyTextureProgramSource);

      if (this.mergeMode === 'concat') {
        this.mergeProgram = _WebGL.webgl2.compileProgram(concatMergeProgramSource);
      } else if (this.mergeMode === 'sum') {
        this.mergeProgram = _WebGL.webgl2.compileProgram(sumMergeProgramSource);
      } else if (this.mergeMode === 'mul') {
        this.mergeProgram = _WebGL.webgl2.compileProgram(mulMergeProgramSource);
      } else if (this.mergeMode === 'ave') {
        this.mergeProgram = _WebGL.webgl2.compileProgram(aveMergeProgramSource);
      }
    }
  }

  setWeights(weightsArr) {
    this.forwardLayer.setWeights(weightsArr.slice(0, weightsArr.length / 2));
    this.backwardLayer.setWeights(weightsArr.slice(weightsArr.length / 2));
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
    this.forwardLayer._callCPU(new _Tensor.default(x.tensor.data, x.tensor.shape));

    this.backwardLayer._callCPU(new _Tensor.default(x.tensor.data, x.tensor.shape));

    const forwardOutput = this.forwardLayer.output;
    const backwardOutput = this.backwardLayer.output;

    if (this.returnSequences) {
      backwardOutput.tensor = backwardOutput.tensor.step(-1);
    }

    const outShape = forwardOutput.tensor.shape.slice();

    if (this.mergeMode === 'concat') {
      outShape[outShape.length - 1] += backwardOutput.tensor.shape[outShape.length - 1];
    }

    this.output = new _Tensor.default([], outShape);

    if (this.mergeMode === 'concat') {
      if (this.returnSequences) {
        _ndarrayOps.default.assign(this.output.tensor.hi(outShape[0], forwardOutput.tensor.shape[1]).lo(0, 0), forwardOutput.tensor);

        _ndarrayOps.default.assign(this.output.tensor.hi(outShape[0], outShape[1]).lo(0, forwardOutput.tensor.shape[1]), backwardOutput.tensor);
      } else {
        _ndarrayOps.default.assign(this.output.tensor.hi(forwardOutput.tensor.shape[0]).lo(0), forwardOutput.tensor);

        _ndarrayOps.default.assign(this.output.tensor.hi(outShape[0]).lo(forwardOutput.tensor.shape[0]), backwardOutput.tensor);
      }
    } else if (this.mergeMode === 'sum') {
      _ndarrayOps.default.addeq(this.output.tensor, forwardOutput.tensor);

      _ndarrayOps.default.addeq(this.output.tensor, backwardOutput.tensor);
    } else if (this.mergeMode === 'mul') {
      _ndarrayOps.default.assigns(this.output.tensor, 1);

      _ndarrayOps.default.muleq(this.output.tensor, forwardOutput.tensor);

      _ndarrayOps.default.muleq(this.output.tensor, backwardOutput.tensor);
    } else if (this.mergeMode === 'ave') {
      _ndarrayOps.default.addeq(this.output.tensor, forwardOutput.tensor);

      _ndarrayOps.default.addeq(this.output.tensor, backwardOutput.tensor);

      _ndarrayOps.default.divseq(this.output.tensor, 2);
    }
  }

  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    if (!this.inputCopy) {
      this.inputCopy = new _Tensor.default([], x.glTextureShape);
      this.inputCopy.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    _WebGL.webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.inputCopy,
      inputs: [{
        input: x,
        name: 'source'
      }]
    });

    this.forwardLayer._callGPU(x);

    this.backwardLayer._callGPU(this.inputCopy);

    const forwardOutput = this.forwardLayer.output;
    const backwardOutput = this.backwardLayer.output;
    const outShape = forwardOutput.glTextureShape.slice();

    if (this.mergeMode === 'concat') {
      outShape[1] += backwardOutput.glTextureShape[1];
    }

    if (!this.output) {
      this.output = new _Tensor.default([], outShape);
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });

      if (!this.returnSequences) {
        this.output.is1D = true;
      }
    }

    _WebGL.webgl2.runProgram({
      program: this.mergeProgram,
      output: this.output,
      inputs: [{
        input: forwardOutput,
        name: 'forward'
      }, {
        input: backwardOutput,
        name: 'backward'
      }]
    });

    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture();
    }
  }

}

exports.default = Bidirectional;