import { webgl2, MAX_TEXTURE_SIZE } from './WebGL2'
import * as tensorUtils from './utils/tensorUtils'
import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import squeeze from 'ndarray-squeeze'

/**
 * Tensor class
 */
export default class Tensor {
  /**
   * Creates a tensor
   *
   * @param {(TypedArray|Array)} data
   * @param {number[]} shape
   * @param {Object} [options]
   */
  constructor(data, shape, options = {}) {
    this.arrayType = options.type || Float32Array

    if (data && data.length && (data instanceof this.arrayType || data instanceof Array)) {
      tensorUtils.checkShape(data, shape)
      if (data instanceof this.arrayType) {
        this.tensor = ndarray(data, shape)
      } else if (data instanceof Array) {
        this.tensor = ndarray(new this.arrayType(data), shape)
      }
    } else if (!data.length && shape.length) {
      // if shape present but data not provided, initialize with 0s
      this.tensor = ndarray(new this.arrayType(shape.reduce((a, b) => a * b, 1)), shape)
    } else {
      this.tensor = ndarray(new this.arrayType([]), [])
    }
  }

  /**
   * Creates WebGL2 texture
   *
   * Without args, defaults to gl.TEXTURE_2D and gl.R32F
   *
   * @param {string} [opts.type]
   * @param {string} [opts.format]
   * @param {boolean} [opts.supportsTextureFragments]
   */
  createGLTexture({ type = '2d', format = 'float', supportsTextureFragments = false }) {
    let shape = []
    if (this.tensor.shape.length === 1) {
      shape = [1, this.tensor.shape[0]]
      this.is1D = true
    } else if (this.tensor.shape.length === 2) {
      shape = this.tensor.shape
    } else if (this.tensor.shape.length === 3 && (type === '2d_array' || type === '3d')) {
      shape = this.tensor.shape
    } else {
      throw new Error('[Tensor] cannot create WebGL2 texture.')
    }

    this.glTextureShape = shape
    this.glTextureType = type
    this.glTextureFormat = format

    if (type === '2d') {
      if (this.glTextureShape[0] > MAX_TEXTURE_SIZE && supportsTextureFragments) {
        this._create2DRowFragmentedGLTexture()
      } else {
        this._create2DGLTexture()
      }
    } else if (type === '2d_array' || type === '3d') {
      this._create3DGLTexture()
    } else {
      throw new Error(`[Tensor] invalid type ${type}.`)
    }
  }

  /**
   * Create 2D WebGL2 texture
   */
  _create2DGLTexture() {
    const gl = webgl2.context
    const textureOptions = webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat)
    const { textureTarget, textureInternalFormat, textureFormat, textureType } = textureOptions

    this.glTexture = gl.createTexture()
    webgl2.storeRef('texture', this.glTexture)
    gl.bindTexture(textureTarget, this.glTexture)

    const shape = this.glTextureShape
    const data = this.tensor.data
    gl.texImage2D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], 0, textureFormat, textureType, data)

    // clamp to edge
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // no interpolation
    gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  }

  /**
   * For 2D WebGL2 texture with first dimension exceeding MAX_TEXTURE_SIZE, creates as array of 2D textures
   */
  _create2DRowFragmentedGLTexture() {
    const gl = webgl2.context
    const textureOptions = webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat)
    const { textureTarget, textureInternalFormat, textureFormat, textureType } = textureOptions

    this.glTextureFragments = []
    this.glTextureFragmentShape = [MAX_TEXTURE_SIZE, this.glTextureShape[1]]
    const shape = this.glTextureFragmentShape
    const numFragments = Math.ceil(this.glTextureShape[0] / MAX_TEXTURE_SIZE)
    let offset = 0

    for (let k = 0; k < numFragments; k++) {
      const glTexture = gl.createTexture()
      webgl2.storeRef('texture', glTexture)
      gl.bindTexture(textureTarget, glTexture)

      // append 0s to last fragment
      let data
      if (k === numFragments - 1) {
        data = new this.arrayType(shape[0] * shape[1])
        data.set(this.tensor.data.slice(offset, offset + shape[0] * shape[1]), 0)
      } else {
        data = this.tensor.data.slice(offset, offset + shape[0] * shape[1])
      }
      gl.texImage2D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], 0, textureFormat, textureType, data)

      // clamp to edge
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      // no interpolation
      gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

      this.glTextureFragments.push(glTexture)
      offset += shape[0] * shape[1]
    }
  }

  /**
   * Create 3D WebGL2 texture
   */
  _create3DGLTexture() {
    const gl = webgl2.context
    const textureOptions = webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat)
    const { textureTarget, textureInternalFormat, textureFormat, textureType } = textureOptions

    this.glTexture = gl.createTexture()
    webgl2.storeRef('texture', this.glTexture)
    gl.bindTexture(textureTarget, this.glTexture)

    const shape = this.glTextureShape
    const data = tensorUtils.data3DLayoutForGL(this.arrayType, this.tensor, this.glTextureShape)
    gl.texImage3D(
      textureTarget,
      0,
      textureInternalFormat,
      shape[1],
      shape[0],
      shape[2],
      0,
      textureFormat,
      textureType,
      data
    )

    // clamp to edge
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    // no interpolation
    gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  }

  /**
   * Converts an array of row-fragmented glTextureFragments into a single column-stacked texture
   */
  convert2DRowFragmentedGLTextureToColStack() {
    if (!this.glTextureFragments || !this.glTextureFragmentShape) {
      throw new Error('[Tensor] no glTextureFragments available.')
    }

    const gl = webgl2.context
    const textureOptions = webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat)
    const { textureTarget, textureInternalFormat, textureFormat, textureType } = textureOptions

    if (!this.glTextureFragmentsAsColStack) {
      this.glTextureFragmentsAsColStack = gl.createTexture()
      webgl2.storeRef('texture', this.glTextureFragmentsAsColStack)
      gl.bindTexture(textureTarget, this.glTextureFragmentsAsColStack)

      const numFragments = this.glTextureFragments.length
      this.glTextureFragmentsAsColStackShape = [
        this.glTextureFragmentShape[0],
        this.glTextureFragmentShape[1] * numFragments
      ]

      const shape = this.glTextureFragmentsAsColStackShape
      const data = new this.arrayType(shape.reduce((a, b) => a * b, 1))
      gl.texImage2D(textureTarget, 0, textureInternalFormat, shape[1], shape[0], 0, textureFormat, textureType, data)

      // clamp to edge
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      // no interpolation
      gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    } else {
      gl.bindTexture(textureTarget, this.glTextureFragmentsAsColStack)
    }

    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo)
    this.glTextureFragments.forEach((texture, k) => {
      gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.copyTexSubImage2D(
        textureTarget,
        0,
        k * this.glTextureFragmentShape[1],
        0,
        0,
        0,
        this.glTextureFragmentShape[1],
        this.glTextureFragmentShape[0]
      )
    })
    gl.deleteFramebuffer(fbo)
  }

  /**
   * Removes glTextureFragmentsAsColStack
   */
  removeGLTextureFragmentsAsColStack() {
    if (this.glTextureFragmentsAsColStack) {
      const gl = webgl2.context
      gl.deleteTexture(this.glTextureFragmentsAsColStack)
      delete this.glTextureFragmentsAsColStack
      delete this.glTextureFragmentsAsColStackShape
    }
  }

  /**
   * Deletes WebGLTexture
   */
  deleteGLTexture() {
    const gl = webgl2.context
    if (this.glTexture) {
      gl.deleteTexture(this.glTexture)
      delete this.glTexture
    }
    if (this.glTextureFragments) {
      this.glTextureFragments.forEach(texture => {
        gl.deleteTexture(texture)
      })
      delete this.glTextureFragments
    }
  }

  /**
   * Replaces data in the underlying ndarray, and the corresponding WebGLTexture if glTexture is present
   *
   * @param {number[]} data
   */
  replaceTensorData(data) {
    if (data && data.length && data instanceof this.arrayType) {
      this.tensor.data.set(data)
    } else if (data && data.length && data instanceof Array) {
      this.tensor.data.set(new this.arrayType(data))
    } else {
      throw new Error('[Tensor] invalid input for replaceTensorData method.')
    }

    if (this.glTexture) {
      const gl = webgl2.context
      const textureOptions = webgl2.getWebGLTextureOptions(this.glTextureType, this.glTextureFormat)
      const { textureTarget, textureFormat, textureType } = textureOptions
      gl.bindTexture(textureTarget, this.glTexture)

      const shape = this.glTextureShape
      if (this.glTextureType === '2d') {
        const data = this.tensor.data
        gl.texSubImage2D(textureTarget, 0, 0, 0, shape[1], shape[0], textureFormat, textureType, data, 0)
      } else if (this.glTextureType === '2d_array' || this.glTextureType === '3d') {
        const data = tensorUtils.data3DLayoutForGL(this.arrayType, this.tensor, shape)
        gl.texSubImage3D(textureTarget, 0, 0, 0, 0, shape[1], shape[0], shape[2], textureFormat, textureType, data, 0)
      }
    }
  }

  /**
   * Transfer data from webgl texture on GPU to ndarray on CPU
   */
  transferFromGLTexture() {
    if (this.glTextureFragments) {
      this.tensor = ndarray(new this.arrayType(this.glTextureShape[0] * this.glTextureShape[1]), this.glTextureShape)
      let offset = 0
      for (let k = 0; k < this.glTextureFragments.length; k++) {
        webgl2.bindOutputTexture(this.glTextureFragments[k], this.glTextureFragmentShape)
        const fragmentData = webgl2.readData(this.glTextureFragmentShape)
        // last fragment may need to be truncated
        if (k === this.glTextureFragments.length - 1) {
          const truncate = this.tensor.data.length - offset
          this.tensor.data.set(fragmentData.subarray(0, truncate), offset)
        } else {
          this.tensor.data.set(fragmentData, offset)
        }
        offset += fragmentData.length
      }
    } else {
      webgl2.bindOutputTexture(this.glTexture, this.glTextureShape)
      this.tensor = ndarray(new this.arrayType([]), this.glTextureShape)
      this.tensor.data = webgl2.readData(this.glTextureShape)
    }

    if (this.is1D && this.glTextureShape[0] === 1) {
      // collapse to 1D
      this.tensor = squeeze(this.tensor, [0])
    }
  }

  /**
   * Reshapes data into 2D representation preserving last axis (typically channel axis)
   */
  reshapeTo2D() {
    const axis = this.tensor.shape.length - 1
    const axisSize = this.tensor.shape[axis]
    const otherAxes = this.tensor.shape.slice(0, axis)
    const otherAxesSize = otherAxes.reduce((a, b) => a * b, 1)

    const reshaped = ndarray(new this.arrayType(otherAxesSize * axisSize), [otherAxesSize, axisSize])

    const otherAxesData = ndarray(new this.arrayType(otherAxesSize), otherAxes)
    const otherAxesDataRaveled = ndarray(new this.arrayType(otherAxesSize), [otherAxesSize])
    const axisSlices = Array(this.tensor.shape.length).fill(null)
    for (let n = 0; n < axisSize; n++) {
      axisSlices[axis] = n
      ops.assign(otherAxesData, this.tensor.pick(...axisSlices))
      otherAxesDataRaveled.data = otherAxesData.data
      ops.assign(reshaped.pick(null, n), otherAxesDataRaveled)
    }

    this.originalShape = this.tensor.shape
    this.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.tensor.shape, false, axis)
    this.tensor = reshaped
    this.is2DReshaped = true
  }

  /**
   * Reshapes tensor in 2D representation back to original
   *
   * Typically called at the end when data is read back from GPU
   *
   * @param {number} axis
   */
  reshapeFrom2D(axis = -1) {
    if (!this.is2DReshaped) {
      throw new Error('[Tensor] not in reshaped 2D representation.')
    }
    if (!this.originalShape) {
      throw new Error('[Tensor] does not contain originalShape.')
    }

    if (axis < 0) {
      axis = this.originalShape.length + axis
    }

    // second axis is the channel, or common, axis
    const channelDataSize = this.tensor.shape[0]
    const channels = this.tensor.shape[1]

    const reshaped = ndarray(new this.arrayType(this.originalShape.reduce((a, b) => a * b, 1)), this.originalShape)
    const channelDataRaveled = ndarray(new this.arrayType(channelDataSize), [channelDataSize])
    const unraveledChannelShape = [...this.originalShape.slice(0, axis), ...this.originalShape.slice(axis + 1)]
    const unraveledChannel = ndarray(
      new this.arrayType(unraveledChannelShape.reduce((a, b) => a * b, 1)),
      unraveledChannelShape
    )
    const axisSlices = Array(this.originalShape.length).fill(null)
    for (let n = 0; n < channels; n++) {
      ops.assign(channelDataRaveled, this.tensor.pick(null, n))
      unraveledChannel.data = channelDataRaveled.data
      axisSlices[axis] = n
      ops.assign(reshaped.pick(...axisSlices), unraveledChannel)
    }

    this.tensor = reshaped
  }

  /**
   * Reshapes data into 2D square representation (underlying data remaining contiguous)
   */
  reshapeTo2DSquare() {
    const squareDim = Math.ceil(Math.sqrt(this.tensor.size))
    const reshaped = ndarray(new this.arrayType(squareDim ** 2), [squareDim, squareDim])
    reshaped.data.set(this.tensor.data)

    this.originalShape = this.tensor.shape
    this.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.tensor.shape, true)
    this.tensor = reshaped
    this.is2DSquareReshaped = true
  }

  /**
   * Reshapes tensor in 2D square representation back to original (underlying data remains contiguous)
   */
  reshapeFrom2DSquare() {
    if (!this.is2DSquareReshaped) {
      throw new Error('[Tensor] not in reshaped 2D square representation.')
    }
    if (!this.originalShape) {
      throw new Error('[Tensor] does not contain originalShape.')
    }

    const size = this.originalShape.reduce((a, b) => a * b, 1)
    const reshaped = ndarray(new this.arrayType(size), this.originalShape)
    reshaped.data.set(this.tensor.data.subarray(0, size))

    this.tensor = reshaped
  }
}
