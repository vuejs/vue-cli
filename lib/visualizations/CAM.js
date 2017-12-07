"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Tensor = _interopRequireDefault(require("../Tensor"));

var _WebGL = require("../WebGL2");

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _ndarrayBlasLevel = require("ndarray-blas-level2");

var _ndarrayGemm = _interopRequireDefault(require("ndarray-gemm"));

var _createGLSLProgram = _interopRequireDefault(require("../webgl/dynamic/createGLSLProgram"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CAM {
  constructor(attrs = {}) {
    this.modelLayersMap = attrs.modelLayersMap;
    this.gpu = attrs.gpu;

    if (!this.modelLayersMap) {
      throw new Error(`[CAM] modelLayersMap is required`);
    }
  }

  initialize() {
    this.modelLayersMap.forEach(layer => {
      if (layer.layerClass === 'GlobalAveragePooling2D') {
        this.enabled = true;
        this.poolLayer = layer;
      }
    });

    if (this.enabled && !this.data) {
      this.featureMaps = this.modelLayersMap.get(this.poolLayer.inbound[0]).output;
      let weightsFound = false;
      let finalLayerReached = false;
      let traversingLayer = this.poolLayer;

      while (!weightsFound && !finalLayerReached) {
        traversingLayer = this.modelLayersMap.get(traversingLayer.outbound[0]);

        if (traversingLayer.weights['kernel']) {
          this.weights = traversingLayer.weights['kernel'];
          weightsFound = true;
        } else if (!traversingLayer.outbound.length) {
          this.weights = this.poolLayer.output;
          finalLayerReached = true;
        }
      }

      if (this.featureMaps.is2DReshaped) {
        this.inputShape = this.featureMaps.originalShape.slice(0, 2);
      } else {
        this.inputShape = this.featureMaps.tensor.shape.slice(0, 2);
      }

      if (this.weights.tensor.shape.length === 1) {
        this.shape = this.inputShape;
      } else {
        const numOutputClasses = this.weights.tensor.shape[1];
        this.shape = [...this.inputShape, numOutputClasses];
      }

      this.data = new Float32Array(this.shape.reduce((a, b) => a * b, 1));
    }
  }

  update() {
    if (!this.enabled) return;
    this.featureMaps = this.modelLayersMap.get(this.poolLayer.inbound[0]).output;

    if (this.gpu) {
      this._updateGPU();
    } else {
      this._updateCPU();
    }

    const outputMin = _ndarrayOps.default.inf(this.output.tensor);

    const outputMax = _ndarrayOps.default.sup(this.output.tensor);

    _ndarrayOps.default.divseq(_ndarrayOps.default.subseq(this.output.tensor, outputMin), outputMax - outputMin);

    this.data = this.output.tensor.data;
  }

  _updateCPU() {
    if (!this.featureMaps.is2DReshaped) {
      this.featureMaps.reshapeTo2D();
    }

    if (this.weights.tensor.shape.length === 1) {
      if (!this.output) {
        this.output = new _Tensor.default([], this.shape);
      }

      const matVec = new _Tensor.default([], [this.shape[0] * this.shape[1]]);
      (0, _ndarrayBlasLevel.gemv)(1, this.featureMaps.tensor, this.weights.tensor, 1, matVec.tensor);
      this.output.replaceTensorData(matVec.tensor.data);
    } else {
      if (!this.output) {
        this.output = new _Tensor.default([], this.shape);
      }

      this.output.reshapeTo2D();
      (0, _ndarrayGemm.default)(this.output.tensor, this.featureMaps.tensor, this.weights.tensor, 1, 1);
      this.output.reshapeFrom2D();
    }

    _ndarrayOps.default.maxseq(this.output.tensor, 0);

    if (this.featureMaps.is2DReshaped) {
      this.featureMaps.reshapeFrom2D();
    }
  }

  _updateGPU() {
    if (!this.output) {
      this.output = new _Tensor.default([], this.shape);
    }

    const isWeights1D = this.weights.is1D;

    if (!this.output.glTexture && isWeights1D) {
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    } else {
      this.output.reshapeTo2D();
      this.output.createGLTexture({
        type: '2d',
        format: 'float'
      });
    }

    const numFeatures = isWeights1D ? this.weights.glTextureShape[1] : this.weights.glTextureShape[0];

    if (!this.program) {
      const programSource = (0, _createGLSLProgram.default)('cam', this.output.glTextureShape, numFeatures, isWeights1D);
      this.program = _WebGL.webgl2.compileProgram(programSource);
    }

    _WebGL.webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{
        input: this.featureMaps,
        name: 'featureMaps'
      }, {
        input: this.weights,
        name: 'weights'
      }]
    });

    this.output.transferFromGLTexture();

    if (this.output.is2DReshaped) {
      this.output.reshapeFrom2D();
    }
  }

}

exports.default = CAM;