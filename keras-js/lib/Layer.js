"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _WebGL = require("./WebGL2");

class Layer {
  constructor(attrs = {}) {
    this.layerClass = 'Layer';
    this.name = attrs.name;
    this.gpu = _WebGL.webgl2.isSupported && attrs.gpu;
    this.params = [];
    this.weights = {};
    this.inbound = [];
    this.outbound = [];
  }

  throwError(message) {
    throw new Error(`[${this.layerClass} layer: ${this.name || ''}] ${message}`);
  }

  toggleGPU(mode) {
    const newMode = typeof mode === 'undefined' ? !this.gpu : mode;

    if (_WebGL.webgl2.isSupported && newMode) {
      this.gpu = true;
    } else {
      this.gpu = false;
    }
  }

  setWeights(weightsArr, createGLTexture = true) {
    this.params.forEach((p, i) => {
      this.weights[p] = weightsArr[i];

      if (this.gpu && createGLTexture) {
        this.weights[p].createGLTexture({
          type: '2d',
          format: 'float'
        });
      }
    });
  }

  call(x) {
    this.output = x;
    return this.output;
  }

}

exports.default = Layer;