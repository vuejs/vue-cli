import Layer from '../../Layer'
import Tensor from '../../Tensor'
import * as activations from '../../activations'
import { webgl2 } from '../../WebGL2'
import createGLSLProgram from '../../webgl/dynamic/createGLSLProgram'
import * as tensorUtils from '../../utils/tensorUtils'
import ops from 'ndarray-ops'
import gemm from 'ndarray-gemm'
import mapInputProgramSource from '../../webgl/mapInput.glsl'
import mapInputFragmentsProgramSource from '../../webgl/mapInput.fragments.glsl'
import matMulProgramSource from '../../webgl/matMul.glsl'
import * as activationProgramSources from '../../activations/programSources'

/**
 * Conv2D layer class
 */
export default class Conv2D extends Layer {
  /**
   * Creates a Conv2D layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.filters] - Number of convolution filters to use
   * @param {number|number[]} [attrs.kernel_size] - Size of the convolution kernel
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Conv2D'

    const {
      filters = 1,
      kernel_size = [3, 3],
      strides = [1, 1],
      padding = 'valid',
      data_format = 'channels_last',
      dilation_rate = [1, 1],
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

    if (Array.isArray(dilation_rate)) {
      this.dilationRate = dilation_rate
    } else {
      this.dilationRate = [dilation_rate, dilation_rate]
    }
    if (
      (this.dilationRate[0] !== 1 || this.dilationRate[1] !== 1) &&
      (this.strides[0] !== 1 || this.strides[1] !== 1)
    ) {
      // Currently, specifying any dilation_rate value != 1 is incompatible with specifying any stride value != 1
      // https://keras.io/layers/convolutional/#conv2d
      this.throwError(`Incompatible combination of dilation_rate with strides.`)
    }

    this.activation = activation
    this.activationFunc = activations[activation]

    this.useBias = use_bias

    // Layer weights specification
    this.params = this.useBias ? ['kernel', 'bias'] : ['kernel']

    // GPU setup
    if (this.gpu) {
      this.mapInputProgram = webgl2.compileProgram(mapInputProgramSource)
      this.mapInputFragmentsProgram = webgl2.compileProgram(mapInputFragmentsProgramSource)
      this.matMulProgram = webgl2.compileProgram(matMulProgramSource)
      this.activationProgram = webgl2.compileProgram(activationProgramSources[this.activation])
    }
  }

  /**
   * Method for setting layer weights. Extends `super` method.
   *
   * W weight tensor is converted to `channels_last` mode if in `channels_first` mode.
   *
   * In `channels_last` mode, W weight tensor has shape [nbRow, nbCol, inputChannels, nbFilter]
   *
   * In `channels_first` mode, W weight tensor has shape [nbFilter, inputChannels, nbRow, nbCol]
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    if (this.dataFormat === 'channels_first') {
      weightsArr[0].tensor = weightsArr[0].tensor.transpose(2, 3, 1, 0)
    }
    super.setWeights(weightsArr, false)

    this._w2row()

    if (this.gpu) {
      this.weights['kernel'] = this.wRowsMat
      this.weights['kernel'].createGLTexture({ type: '2d', format: 'float' })
      if (this.useBias) {
        this.weights['bias'].createGLTexture({ type: '2d', format: 'float' })
      }
    }
  }

  /**
   * Layer computational logic
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
   * Method for computing output dimensions and padding, based on input dimensions, kernel size, and padding mode.
   *
   * For tensorflow implementation of padding, see:
   * https://github.com/tensorflow/tensorflow/blob/master/tensorflow/core/framework/common_shape_fns.cc
   *
   * @param {number[]} inputShape
   */
  _calcOutputShape(inputShape) {
    if (this.outputShape && this.inputPadding) {
      return
    }

    const inputRows = inputShape[0]
    const inputCols = inputShape[1]
    const [nbFilter, nbRow, nbCol] = this.kernelShape

    // effective shape after filter dilation
    const nbRowDilated = nbRow + (nbRow - 1) * (this.dilationRate[0] - 1)
    const nbColDilated = nbCol + (nbCol - 1) * (this.dilationRate[1] - 1)

    const outputRows =
      this.padding === 'same'
        ? Math.floor((inputRows + this.strides[0] - 1) / this.strides[0])
        : Math.floor((inputRows - nbRowDilated + this.strides[0]) / this.strides[0])
    const outputCols =
      this.padding === 'same'
        ? Math.floor((inputCols + this.strides[1] - 1) / this.strides[1])
        : Math.floor((inputCols - nbColDilated + this.strides[1]) / this.strides[1])
    const outputChannels = nbFilter

    const paddingRow =
      this.padding === 'same'
        ? Math.max(0, Math.floor((outputRows - 1) * this.strides[0] + nbRowDilated - inputRows))
        : 0
    const paddingCol =
      this.padding === 'same'
        ? Math.max(0, Math.floor((outputCols - 1) * this.strides[1] + nbColDilated - inputCols))
        : 0
    const paddingRowBefore = Math.floor(paddingRow / 2)
    const paddingRowAfter = paddingRow - paddingRowBefore
    const paddingColBefore = Math.floor(paddingCol / 2)
    const paddingColAfter = paddingCol - paddingColBefore

    this.outputShape = [outputRows, outputCols, outputChannels]
    this.inputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter]
  }

  /**
   * Pad input tensor if necessary, for padding='same'. See above for notes on calculating padding.
   *
   * @param {Tensor} x
   * @param {number} [padValue]
   * @returns {Tensor}
   */
  _padInput(x, padValue = 0) {
    if (this.padding === 'same') {
      const [inputRows, inputCols, inputChannels] = x.tensor.shape
      const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding
      const newRows = inputRows + paddingRowBefore + paddingRowAfter
      const newCols = inputCols + paddingColBefore + paddingColAfter
      const _x = new Tensor([], [newRows, newCols, inputChannels])
      if (padValue !== 0) {
        ops.assigns(_x.tensor, padValue)
      }
      ops.assign(
        _x.tensor
          .hi(inputRows + paddingRowBefore, inputCols + paddingColBefore, inputChannels)
          .lo(paddingRowBefore, paddingColBefore, 0),
        x.tensor
      )
      return _x
    }
    return x
  }

  /**
   * Convert input tensor to column matrix
   *
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
    const patchLen = nbRow * nbCol * inputChannels

    // effective shape after filter dilation
    const nbRowDilated = nbRow + (nbRow - 1) * (this.dilationRate[0] - 1)
    const nbColDilated = nbCol + (nbCol - 1) * (this.dilationRate[1] - 1)

    if (!this.imColsMat) {
      this.imColsMat = new Tensor([], [nbPatches, patchLen])
    }

    if (nbRowDilated === 1 && nbColDilated === 1 && this.strides[0] === 1 && this.strides[1] === 1) {
      this.imColsMat.replaceTensorData(x.tensor.data)
      return this.imColsMat
    }

    const patch = new Tensor([], [nbRow, nbCol, inputChannels])
    let offset = 0
    for (let i = 0, limit = inputRows - nbRowDilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputCols - nbColDilated; j <= limit; j += this.strides[1]) {
        ops.assign(
          patch.tensor,
          x.tensor
            .hi(i + nbRowDilated, j + nbColDilated, inputChannels)
            .lo(i, j, 0)
            .step(this.dilationRate[0], this.dilationRate[1], 1)
        )
        this.imColsMat.tensor.data.set(patch.tensor.data, offset)
        offset += patchLen
      }
    }

    return this.imColsMat
  }

  /**
   * Convert filter weights to row matrix
   *
   * @returns {Tensor}
   */
  _w2row() {
    const inputChannels = this.weights['kernel'].tensor.shape[2]
    const [nbFilter, nbRow, nbCol] = this.kernelShape
    const patchLen = nbRow * nbCol * inputChannels

    this.wRowsMat = new Tensor([], [patchLen, nbFilter])

    const patch = new Tensor([], [nbRow, nbCol, inputChannels])
    const patchRaveled = new Tensor([], [patchLen])
    for (let n = 0; n < nbFilter; n++) {
      ops.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, null, n))
      patchRaveled.replaceTensorData(patch.tensor.data)
      ops.assign(this.wRowsMat.tensor.pick(null, n), patchRaveled.tensor)
    }

    return this.wRowsMat
  }

  /**
   * CPU call
   *
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
    const matMul = new Tensor([], [nbPatches, nbFilter])

    if (this.useBias) {
      for (let n = 0; n < nbFilter; n++) {
        ops.assigns(matMul.tensor.pick(null, n), this.weights['bias'].tensor.get(n))
      }
    }
    gemm(matMul.tensor, this.imColsMat.tensor, this.wRowsMat.tensor, 1, 1)

    this.output = new Tensor([], this.outputShape)

    let outputChannelRaveled = new Tensor([], [outputRows * outputCols])
    let outputChannel = new Tensor([], [outputRows, outputCols])
    for (let n = 0; n < nbFilter; n++) {
      ops.assign(outputChannelRaveled.tensor, matMul.tensor.pick(null, n))
      outputChannel.replaceTensorData(outputChannelRaveled.tensor.data)
      ops.assign(this.output.tensor.pick(null, null, n), outputChannel.tensor)
    }

    this.activationFunc(this.output)

    // convert back to channels_first ordering if necessary
    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(2, 0, 1)
    }
  }

  /**
   * Creates a index mapping from the 2D-reshaped input tensor with associated 3D tensor shape to the representation
   * required prior to the matrix multiply. This allows us to work directly on the 2D tensor representations rather
   * than needing to reshape to the 3D reprentation and calling im2col.
   *
   * @param {Object} indicesForReshaped
   */
  _createIndexMap(indicesForReshaped) {
    if (this.indexMap) {
      return
    }

    let [inputRows, inputCols, inputChannels] = this.inputShape

    let indices = new Tensor(indicesForReshaped.data, indicesForReshaped.shape, { type: Int32Array })

    // padding for border mode 'same'
    if (this.padding === 'same') {
      const [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter] = this.inputPadding
      inputRows = inputRows + paddingRowBefore + paddingRowAfter
      inputCols = inputCols + paddingColBefore + paddingColAfter
      const padValue = -1
      indices = this._padInput(indices, padValue)
    }

    const nbRow = this.kernelShape[1]
    const nbCol = this.kernelShape[2]
    const outputRows = this.outputShape[0]
    const outputCols = this.outputShape[1]
    const nbPatches = outputRows * outputCols
    const patchLen = nbRow * nbCol * inputChannels

    // effective shape after filter dilation
    const nbRowDilated = nbRow + (nbRow - 1) * (this.dilationRate[0] - 1)
    const nbColDilated = nbCol + (nbCol - 1) * (this.dilationRate[1] - 1)

    this.indexMap = new Tensor([], [nbPatches, patchLen], { type: Int32Array })

    const indicesPatch = new Tensor([], [nbRow, nbCol, inputChannels])
    let offset = 0
    for (let i = 0, limit = inputRows - nbRowDilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputCols - nbColDilated; j <= limit; j += this.strides[1]) {
        ops.assign(
          indicesPatch.tensor,
          indices.tensor
            .hi(i + nbRowDilated, j + nbColDilated, inputChannels)
            .lo(i, j, 0)
            .step(this.dilationRate[0], this.dilationRate[1], 1)
        )
        this.indexMap.tensor.data.set(indicesPatch.tensor.data, offset)
        offset += patchLen
      }
    }

    this.indexMap.createGLTexture({ type: '2d', format: 'int', supportsTextureFragments: true })
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    let outputTextureShape
    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape
      this._calcOutputShape(this.inputShape)
      this._createIndexMap(x.indicesForReshaped)
      outputTextureShape = [this.indexMap.glTextureShape[0], this.weights['kernel'].glTextureShape[1]]
    } else {
      this.inputShape = x.tensor.shape
      this._calcOutputShape(this.inputShape)
      x = this._padInput(x)
      this._im2col(x)
      this.imColsMat.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      outputTextureShape = [this.imColsMat.glTextureShape[0], this.weights['kernel'].glTextureShape[1]]
    }

    // create output textures if doesn't already exist
    if (this.activation !== 'linear' && !this.outputPreactiv) {
      this.outputPreactiv = new Tensor([], outputTextureShape)
      this.outputPreactiv.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      this.outputPreactiv.is2DReshaped = true
      this.outputPreactiv.originalShape = this.outputShape
      this.outputPreactiv.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1)
    }
    if (!this.output) {
      this.output = new Tensor([], outputTextureShape)
      this.output.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      this.output.is2DReshaped = true
      this.output.originalShape = this.outputShape
      this.output.indicesForReshaped = tensorUtils.createIndicesFor2DReshaped(this.outputShape, false, -1)
    }

    if (x.is2DReshaped || x.is2DSquareReshaped) {
      // run conv2d program, which involves mapping the input using indexMap, and matrix multiply with weights
      const hasFragments = Boolean(x.glTextureFragments)
      if (hasFragments) {
        x.convert2DRowFragmentedGLTextureToColStack()
      }
      if (!this.convProgram) {
        const convProgramSource = createGLSLProgram(
          'conv2d',
          this.output.glTextureFragmentShape ? this.output.glTextureFragmentShape : this.output.glTextureShape,
          x.glTextureFragmentShape ? x.glTextureFragmentShape : x.glTextureShape,
          this.indexMap.glTextureFragmentShape ? this.indexMap.glTextureFragmentShape : this.indexMap.glTextureShape,
          this.useBias,
          hasFragments
        )
        this.convProgram = webgl2.compileProgram(convProgramSource)
      }
      webgl2.runProgram({
        program: this.convProgram,
        output: this.activation === 'linear' ? this.output : this.outputPreactiv,
        inputs: [
          { input: x, name: 'x' },
          { input: this.indexMap, name: 'indexMap' },
          { input: this.weights['kernel'], name: 'kernel' },
          ...(this.useBias ? [{ input: this.weights['bias'], name: 'bias' }] : [])
        ],
        supportsTextureFragments: true
      })
      if (hasFragments) {
        x.removeGLTextureFragmentsAsColStack()
      }
    } else {
      // run matrix multiply on result of im2col
      const matMulInputs = [{ input: this.imColsMat, name: 'A' }, { input: this.weights['kernel'], name: 'B' }]
      if (this.useBias) {
        matMulInputs.push({ input: this.weights['bias'], name: 'C' })
      }
      webgl2.runProgram({
        program: this.matMulProgram,
        output: this.activation === 'linear' ? this.output : this.outputPreactiv,
        inputs: matMulInputs,
        uniforms: [{ value: this.useBias ? 1 : 0, type: 'bool', name: 'addC' }],
        supportsTextureFragments: true
      })
    }

    // Activation
    if (this.activation !== 'linear') {
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
