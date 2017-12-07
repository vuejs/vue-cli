"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _WebGL = require("./WebGL2");

var tensorUtils = _interopRequireWildcard(require("./utils/tensorUtils"));

var _ndarray = _interopRequireDefault(require("ndarray"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

var _ndarraySqueeze = _interopRequireDefault(require("ndarray-squeeze"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Tensor {
  constructor(data, shape, options = {}) {
    this.arrayType = options.type || Float32Array;

    if (data && data.length && (data instanceof this.arrayType || data instanceof Array)) {
      tensorUtils.checkShape(data, shape);

      if (data instanceof this.arrayType) {
        this.tensor = (0, _ndarray.default)(data, shape);
      } else if (data instanceof Array) {
        this.tensor = (0, _ndarray.default)(new this.arrayType(data), shape);
      }
    } else if (!data.length && shape.length) {
      this.tensor = (0, _ndarray.default)(new this.arrayType(shape.reduce((a, b) => a * b, 1)), shape);
    } else {
      this.tensor = (0, _ndarray.default)(new this.arrayType([]), []);
    }
  }

  createGLTexture({
    type = '2d',
    format = 'float',
    supportsTextureFragments = false
  }) {
    let shape = [];

    if (this.tensor.shape.length === 1) {
      shape = [1, this.tensor.shape[0]];
      this.is1D = true;
    } else if (this.tensor.shape.length === 2) {
      shape = this.tensor.shape;
    } else if (this.tensor.shape.length === 3 && (type === '2d_array' || type === '3d')) {
      shape = this.tensor.shape;
    } else {
      throw new Error('[Tensor] cannot create WebGL2 texture.');
    }

    this.glTextureShape = shape;
    this.glTextureType = type;
    this.glTextureFormat = format;

    if (type === '2d') {
      if (this.glTextureShape[0] > _WebGL.MAX_TEXTURE_SIZE && supportsTextureFragments) {
        this._create2DRowFragmentedGLTexture();
      } else {
        this._create2DGLTexture();
      }
    } else if (type === '2d_array' || type === '3d') {
      this._create3DGLTexture();
    } else {
      throw new Error(`[Tensor] invalid type ${type}.`);
    }
  }

  _create2DGLTexture() {
    const gl = _WebGL.webgl2.context;

    const textureOptions = _WebGL.webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat);

    const {
      textureTarget,
      textureInternalFormat,
      textureFormat,
      textureType
    } = textureOptions;
    this.glTexture = gl.createTexture();

    _WebGL.webgl2.storeRef('texture', this.glTexture);

    gl.bindTexture(textureTarget, this.glTexture);
    const shape = this.glTextureShape;
    const data = this.tensor.data;
    gl.texImage2D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], 0, textureFormat, textureType, data);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  }

  _create2DRowFragmentedGLTexture() {
    const gl = _WebGL.webgl2.context;

    const textureOptions = _WebGL.webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat);

    const {
      textureTarget,
      textureInternalFormat,
      textureFormat,
      textureType
    } = textureOptions;
    this.glTextureFragments = [];
    this.glTextureFragmentShape = [_WebGL.MAX_TEXTURE_SIZE, this.glTextureShape[1]];
    const shape = this.glTextureFragmentShape;
    const numFragments = Math.ceil(this.glTextureShape[0] / _WebGL.MAX_TEXTURE_SIZE);
    let offset = 0;

    for (let k = 0; k < numFragments; k++) {
      const glTexture = gl.createTexture();

      _WebGL.webgl2.storeRef('texture', glTexture);

      gl.bindTexture(textureTarget, glTexture);
      let data;

      if (k === numFragments - 1) {
        data = new this.arrayType(shape[0] * shape[1]);
        data.set(this.tensor.data.slice(offset, offset + shape[0] * shape[1]), 0);
      } else {
        data = this.tensor.data.slice(offset, offset + shape[0] * shape[1]);
      }

      gl.texImage2D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], 0, textureFormat, textureType, data);
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      this.glTextureFragments.push(glTexture);
      offset += shape[0] * shape[1];
    }
  }

  _create3DGLTexture() {
    const gl = _WebGL.webgl2.context;

    const textureOptions = _WebGL.webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat);

    const {
      textureTarget,
      textureInternalFormat,
      textureFormat,
      textureType
    } = textureOptions;
    this.glTexture = gl.createTexture();

    _WebGL.webgl2.storeRef('texture', this.glTexture);

    gl.bindTexture(textureTarget, this.glTexture);
    const shape = this.glTextureShape;
    const data = tensorUtils.data3DLayoutForGL(this.arrayType, this.tensor, this.glTextureShape);
    gl.texImage3D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], shape[2], 0, textureFormat, textureType, data);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  }

  convert2DRowFragmentedGLTextureToColStack() {
    if (!this.glTextureFragments || !this.glTextureFragmentShape) {
      throw new Error('[Tensor] no glTextureFragments available.');
    }

    const gl = _WebGL.webgl2.context;

    const textureOptions = _WebGL.webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat);

    const {
      textureTarget,
      textureInternalFormat,
      textureFormat,
      textureType
    } = textureOptions;

    if (!this.glTextureFragmentsAsColStack) {
      this.glTextureFragmentsAsColStack = gl.createTexture();

      _WebGL.webgl2.storeRef('texture', this.glTextureFragmentsAsColStack);

      gl.bindTexture(textureTarget, this.glTextureFragmentsAsColStack);
      const numFragments = this.glTextureFragments.length;
      this.glTextureFragmentsAsColStackShape = [this.glTextureFragmentShape[0], this.glTextureFragmentShape[1] * numFragments];
      const shape = this.glTextureFragmentsAsColStackShape;
      const data = new this.arrayType(shape.reduce((a, b) => a * b, 1));
      gl.texImage2D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], 0, textureFormat, textureType, data);
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    } else {
      gl.bindTexture(textureTarget, this.glTextureFragmentsAsColStack);
    }

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo);
    this.glTextureFragments.forEach((texture, k) => {
      gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.copyTexSubImage2D(textureTarget, 0, k * this.glTextureFragmentShape[1], 0, 0, 0, this.glTextureFragmentShape[1], this.glTextureFragmentShape[0]);
    });
    gl.deleteFramebuffer(fbo);
  }

  removeGLTextureFragmentsAsColStack() {
    if (this.glTextureFragmentsAsColStack) {
      const gl = _WebGL.webgl2.context;
      gl.deleteTexture(this.glTextureFragmentsAsColStack);
      delete this.glTextureFragmentsAsColStack;
      delete this.glTextureFragmentsAsColStackShape;
    }
  }

  deleteGLTexture() {
    const gl = _WebGL.webgl2.context;

    if (this.glTexture) {
      gl.deleteTexture(this.glTexture);
      delete this.glTexture;
    }

    if (this.glTextureFragments) {
      this.glTextureFragments.forEach(texture => {
        gl.deleteTexture(texture);
      });
      delete this.glTextureFragments;
    }
  }

  replaceTensorData(data) {
    if (data && data.length && data instanceof this.arrayType) {
      this.tensor.data.set(data);
    } else if (data && data.length && data instanceof Array) {
      this.tensor.data.set(new this.arrayType(data));
    } else {
      throw new Error('[Tensor] invalid input for replaceTensorData method.');
    }

    if (this.glTexture) {
      const gl = _WebGL.webgl2.context;

      const textureOptions = _WebGL.webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat);

      const {
        textureTarget,
        textureFormat,
        textureType
      } = textureOptions;
      gl.bindTexture(textureTarget, this.glTexture);
      const shape = this.glTextureShape;

      if (this.glTextureType === '2d') {
        const data = this.tensor.data;
        gl.texSubImage2D(textureTarget, 0, 0, 0, shape[1], shape[0], textureFormat, textureType, data, 0);
      } else if (this.glTextureType === '2d_array' || this.glTextureType === '3d') {
        const data = tensorUtils.data3DLayoutForGL(this.arrayType, this.tensor, shape);
        gl.texSubImage3D(textureTarget, 0, 0, 0, 0, shape[1], shape[0], shape[2], textureFormat, textureType, data, 0);
      }
    }
  }

  transferFromGLTexture() {
    if (this.glTextureFragments) {
      this.tensor = (0, _ndarray.default)(new this.arrayType(this.glTextureShape[0] * this.glTextureShape[1]), this.glTextureShape);
      let offset = 0;

      for (let k = 0; k < this.glTextureFragments.length; k++) {
        _WebGL.webgl2.bindOutputTexture(this.glTextureFragments[k], this.glTextureFragmentShape);

        const fragmentData = _WebGL.webgl2.readData(this.glTextureFragmentShape);

        if (k === this.glTextureFragments.length - 1) {
          const truncate = this.tensor.data.length - offset;
          this.tensor.data.set(fragmentData.subarray(0, truncate), offset);
        } else {
          this.tensor.data.set(fragmentData, offset);
        }

        offset += fragmentData.length;
      }
    } else {
      _WebGL.webgl2.bindOutputTexture(this.glTexture, this.glTextureShape);

      this.tensor = (0, _ndarray.default)(new this.arrayType([]), this.glTextureShape);
      this.tensor.data = _WebGL.webgl2.readData(this.glTextureShape);
    }

    if (this.is1D && this.glTextureShape[0] === 1) {
      this.tensor = (0, _ndarraySqueeze.default)(this.tensor, [0]);
    }
  }

  reshapeTo2D() {
    const axis = this.tensor.shape.length - 1;
    const axisSize = this.tensor.shape[axis];
    const otherAxes = this.tensor.shape.slice(0, axis);
    const otherAxesSize = otherAxes.reduce((a, b) => a * b, 1);
    const reshaped = (0, _ndarray.default)(new this.arrayType(otherAxesSize * axisSize), [otherAxesSize, axisSize]);
    const otherAxesData = (0, _ndarray.default)(new this.arrayType(otherAxesSize), otherAxes);
    const otherAxesDataRaveled = (0, _ndarray.default)(new this.arrayType(otherAxesSize), [otherAxesSize]);
    const axisSlices = Array(this.tensor.shape.length).fill(null);

    for (let n = 0; n < axisSize; n++) {
      axisSlices[axis] = n;

      _ndarrayOps.default.assign(otherAxesData, this.tensor.pick(...axisSlices));

      otherAxesDataRaveled.data = otherAxesData.data;

      _ndarrayOps.default.assign(reshaped.pick(null, n), otherAxesDataRaveled);
    }

    this.originalShape = this.tensor.shape;
    this.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.tensor.shape, false, axis);
    this.tensor = reshaped;
    this.is2DReshaped = true;
  }

  reshapeFrom2D(axis = -1) {
    if (!this.is2DReshaped) {
      throw new Error('[Tensor] not in reshaped 2D representation.');
    }

    if (!this.originalShape) {
      throw new Error('[Tensor] does not contain originalShape.');
    }

    if (axis < 0) {
      axis = this.originalShape.length + axis;
    }

    const channelDataSize = this.tensor.shape[0];
    const channels = this.tensor.shape[1];
    const reshaped = (0, _ndarray.default)(new this.arrayType(this.originalShape.reduce((a, b) => a * b, 1)), this.originalShape);
    const channelDataRaveled = (0, _ndarray.default)(new this.arrayType(channelDataSize), [channelDataSize]);
    const unraveledChannelShape = [...this.originalShape.slice(0, axis), ...this.originalShape.slice(axis + 1)];
    const unraveledChannel = (0, _ndarray.default)(new this.arrayType(unraveledChannelShape.reduce((a, b) => a * b, 1)), unraveledChannelShape);
    const axisSlices = Array(this.originalShape.length).fill(null);

    for (let n = 0; n < channels; n++) {
      _ndarrayOps.default.assign(channelDataRaveled, this.tensor.pick(null, n));

      unraveledChannel.data = channelDataRaveled.data;
      axisSlices[axis] = n;

      _ndarrayOps.default.assign(reshaped.pick(...axisSlices), unraveledChannel);
    }

    this.tensor = reshaped;
  }

  reshapeTo2DSquare() {
    const squareDim = Math.ceil(Math.sqrt(this.tensor.size));
    const reshaped = (0, _ndarray.default)(new this.arrayType(squareDim ** 2), [squareDim, squareDim]);
    reshaped.data.set(this.tensor.data);
    this.originalShape = this.tensor.shape;
    this.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.tensor.shape, true);
    this.tensor = reshaped;
    this.is2DSquareReshaped = true;
  }

  reshapeFrom2DSquare() {
    if (!this.is2DSquareReshaped) {
      throw new Error('[Tensor] not in reshaped 2D square representation.');
    }

    if (!this.originalShape) {
      throw new Error('[Tensor] does not contain originalShape.');
    }

    const size = this.originalShape.reduce((a, b) => a * b, 1);
    const reshaped = (0, _ndarray.default)(new this.arrayType(size), this.originalShape);
    reshaped.data.set(this.tensor.data.subarray(0, size));
    this.tensor = reshaped;
  }

}

exports.default = Tensor;