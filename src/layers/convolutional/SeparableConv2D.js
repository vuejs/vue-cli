import Layer from '../../Layer'
import Tensor from '../../Tensor'
import * as activations from '../../activations'
import { webgl2 } from '../../WebGL2'
import * as tensorUtils from '../../utils/tensorUtils'
import ops from 'ndarray-ops'
import gemm from 'ndarray-gemm'
import Conv2D from './Conv2D'
import * as activationProgramSources from '../../activations/programSources'

/**
 * _DepthwiseConv2D layer class
 */
class _DepthwiseConv2D extends Conv2D {
  /**
   * @param {Object} [attrs]
   */
  constructor(attrs = {}) {
    super(attrs)
  }

  /**
   * @param {number[]} inputShape
   */
  _calcOutputShape(inputShape) {
    super._calcOutputShape(inputShape)
    const nbFilter = this.kernelShape[0]
    const inputChannels = inputShape[2]
    this.outputShape[2] = nbFilter * inputChannels
  }

  /**
   * @param {Tensor} x
   * @returns {Tensor}
   */
  _im2col(x) {
    const [inputRows, inputCols, inputChannels] = x.tensor.shape
    const nbRow = this.kernelShape[1]
    const nbCol = this.kernelShape[2]
    const outputRows = this.outputShape[0]
    const outputCols = this.outputShape[1]
    const nbPatches = outputRows * outputCols
    const patchLen = nbRow * nbCol

    if (!this.imColsMat) {
      this.imColsMat = new Tensor([], [nbPatches * inputChannels, patchLen])
    }

    let patch = new Tensor([], [nbRow, nbCol, 1])
    let offset = 0
    for (let c = 0; c < inputChannels; c++) {
      for (let i = 0, limit = inputRows - nbRow; i <= limit; i += this.strides[0]) {
        for (let j = 0, limit = inputCols - nbCol; j <= limit; j += this.strides[1]) {
          ops.assign(patch.tensor, x.tensor.hi(i + nbRow, j + nbCol, c + 1).lo(i, j, c))
          this.imColsMat.tensor.data.set(patch.tensor.data, offset)
          offset += patchLen
        }
      }
    }

    return this.imColsMat
  }

  /**
   * @returns {Tensor}
   */
  _w2row() {
    const inputChannels = this.weights['kernel'].tensor.shape[2]
    const [nbFilter, nbRow, nbCol] = this.kernelShape
    const patchLen = nbRow * nbCol

    this.wRowsMat = new Tensor([], [patchLen, nbFilter * inputChannels])

    let patch = new Tensor([], [nbRow, nbCol])
    let patchRaveled = new Tensor([], [patchLen])
    let p = 0
    for (let c = 0; c < inputChannels; c++) {
      for (let n = 0; n < nbFilter; n++) {
        ops.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, c, n))
        patchRaveled.replaceTensorData(patch.tensor.data)
        ops.assign(this.wRowsMat.tensor.pick(null, p), patchRaveled.tensor)
        p += 1
      }
    }

    return this.wRowsMat
  }

  /**
   * @param {Tensor} x
   */
  _callCPU(x) {
    this.inputShape = x.tensor.shape
    this._calcOutputShape(this.inputShape)
    x = this._padInput(x)
    this._im2col(x)

    const nbFilter = this.kernelShape[0]
    const outputRows = this.outputShape[0]
    const outputCols = this.outputShape[1]
    const nbPatches = outputRows * outputCols
    const inputChannels = this.inputShape[2]
    const matMul = new Tensor([], [nbPatches * inputChannels, nbFilter * inputChannels])

    gemm(matMul.tensor, this.imColsMat.tensor, this.wRowsMat.tensor, 1, 1)

    this.output = new Tensor([], this.outputShape)

    const outputDataLength = outputRows * outputCols * nbFilter * inputChannels
    let dataFiltered = new Float32Array(outputDataLength)
    for (let c = 0; c < inputChannels; c++) {
      for (let n = c * outputDataLength + c * nbFilter; n < (c + 1) * outputDataLength; n += nbFilter * inputChannels) {
        for (let m = 0; m < nbFilter; m++) {
          dataFiltered[n + m - c * outputDataLength] = matMul.tensor.data[n + m]
        }
      }
    }
    this.output.replaceTensorData(dataFiltered)
  }

  _createOutputReshapeIndexMap() {
    if (this.reshapeIndexMap) {
      return
    }

    const nbFilter = this.kernelShape[0]
    const reshape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]]
    const reshapeRowIndices = new Tensor([], reshape, { type: Int32Array })
    const reshapeColIndices = new Tensor([], reshape, { type: Int32Array })
    this.reshapeIndexMap = new Tensor([], reshape, { type: Int32Array })
    for (let j = 0; j < reshape[1]; j++) {
      for (let i = 0; i < reshape[0]; i++) {
        ops.assigns(reshapeRowIndices.tensor.pick(i, j), i + Math.floor(j / nbFilter) * reshape[0])
      }
    }
    for (let j = 0; j < reshape[1]; j++) {
      ops.assigns(reshapeColIndices.tensor.pick(null, j), j)
    }
    // i * cols + j
    ops.muls(this.reshapeIndexMap.tensor, reshapeRowIndices.tensor, reshape[1])
    ops.addeq(this.reshapeIndexMap.tensor, reshapeColIndices.tensor)

    this.reshapeIndexMap.createGLTexture({ type: '2d', format: 'int', supportsTextureFragments: true })
  }

  /**
   * @param {Tensor} x
   */
  _callGPU(x) {
    super._callGPU(x)

    this._createOutputReshapeIndexMap()
    if (!this.outputReshaped) {
      const reshape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]]
      this.outputReshaped = new Tensor([], reshape)
      this.outputReshaped.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      this.outputReshaped.is2DReshaped = true
      this.outputReshaped.originalShape = this.outputShape
      this.outputReshaped.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1)
    }
    if (this.output.glTextureFragments) {
      this.output.convert2DRowFragmentedGLTextureToColStack()
    }
    webgl2.runProgram({
      program: this.output.glTextureFragments ? this.mapInputFragmentsProgram : this.mapInputProgram,
      output: this.outputReshaped,
      inputs: [{ input: this.output, name: 'x' }, { input: this.reshapeIndexMap, name: 'indexMap' }],
      uniforms: [{ value: this.output.glTextureShape[1], type: 'int', name: 'inputCols' }],
      supportsTextureFragments: true
    })
    if (this.output.glTextureFragments) {
      this.output.removeGLTextureFragmentsAsColStack()
    }
  }
}

/**
 * SeparableConv2D layer class
 */
export default class SeparableConv2D extends Layer {
  /**
   * Creates a SeparableConv2D layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.filters] - Number of convolution filters to use
   * @param {number|number[]} [attrs.kernel_size] - Size of the convolution kernel
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'SeparableConv2D'

    const {
      filters = 1,
      kernel_size = [1, 1],
      strides = [1, 1],
      padding = 'valid',
      data_format = 'channels_last',
      depth_multiplier = 1,
      activation = 'linear',
      use_bias = true
    } = attrs

    if (Array.isArray(kernel_size)) {
      this.kernelShape = [filters, ...kernel_size]
    } else {
      this.kernelShape = [filters, kernel_size, kernel_size]
    }

    if (Array.isArray(strides)) {
      this.strides = strides
    } else {
      this.strides = [strides, strides]
    }

    if (padding === 'valid' || padding === 'same') {
      this.padding = padding
    } else {
      this.throwError('Invalid padding.')
    }

    if (data_format === 'channels_last' || data_format === 'channels_first') {
      this.dataFormat = data_format
    } else {
      this.throwError('Only channels_last and channels_first data formats are allowed.')
    }

    this.activation = activation
    this.activationFunc = activations[activation]

    if (padding === 'valid' || padding === 'same') {
      this.padding = padding
    } else {
      this.throwError('Invalid padding.')
    }

    this.useBias = use_bias

    // Layer weights specification
    this.params = this.useBias
      ? ['depthwise_kernel', 'pointwise_kernel', 'bias']
      : ['depthwise_kernel', 'pointwise_kernel']

    // SeparableConv2D has two components: depthwise, and pointwise.
    // Activation function and bias is applied at the end.
    // Subsampling (striding) only performed on depthwise part, not the pointwise part.
    this.depthwiseConvAttrs = {
      filters: depth_multiplier,
      kernel_size: [this.kernelShape[1], this.kernelShape[2]],
      strides: this.strides,
      padding,
      data_format,
      activation: 'linear',
      use_bias: false,
      gpu: attrs.gpu
    }
    this.pointwiseConvAttrs = {
      filters,
      kernel_size: [1, 1],
      strides: [1, 1],
      padding,
      data_format,
      activation: 'linear',
      use_bias,
      gpu: attrs.gpu
    }

    // GPU setup
    if (this.gpu) {
      this.activationProgram = webgl2.compileProgram(activationProgramSources[this.activation])
    }
  }

  /**
   * Method for setting layer weights. Override `super` method since weights must be set in component Conv2D layers.
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    this._depthwiseConv = new _DepthwiseConv2D(this.depthwiseConvAttrs)
    this._depthwiseConv.setWeights(weightsArr.slice(0, 1))
    this._pointwiseConv = new Conv2D(this.pointwiseConvAttrs)
    this._pointwiseConv.setWeights(weightsArr.slice(1, 3))
  }

  /**
   * Method for layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */
  call(x) {
    if (this.gpu) {
      this._callGPU(x)
    } else {
      this._callCPU(x)
    }
    return this.output
  }

  /**
   * CPU call
   *
   * @param {Tensor} x
   */
  _callCPU(x) {
    this._depthwiseConv._callCPU(x)
    this._pointwiseConv._callCPU(this._depthwiseConv.output)
    this.output = this._pointwiseConv.output
    this.activationFunc(this.output)
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    // prevent GPU -> CPU data transfer by specifying non-empty outbound nodes array on these internal Conv2D layers
    this._depthwiseConv.outbound = [null]
    this._pointwiseConv.outbound = [null]

    this._depthwiseConv._callGPU(x)
    this._pointwiseConv._callGPU(this._depthwiseConv.outputReshaped)

    // Activation
    if (this.activation === 'linear') {
      this.output = this._pointwiseConv.output
    } else {
      if (!this.output) {
        this.output = new Tensor([], this._pointwiseConv.output.glTextureShape)
        this.output.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
        this.output.is2DReshaped = true
        this.output.originalShape = this._pointwiseConv.output.originalShape
        this.output.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(
          this._pointwiseConv.output.originalShape,
          false,
          -1
        )
      }
      this.outputPreactiv = this._pointwiseConv.output
      webgl2.runProgram({
        program: this.activationProgram,
        output: this.output,
        inputs: [{ input: this.outputPreactiv, name: 'x' }],
        supportsTextureFragments: true
      })
    }

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
      this.output.reshapeFrom2D()

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        this.output.tensor = this.output.tensor.transpose(2, 0, 1)
      }
    }
  }
}
