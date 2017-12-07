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
 * Conv3D layer class
 */
export default class Conv3D extends Layer {
  /**
   * Creates a Conv3D layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.filters] - Number of convolution filters to use
   * @param {number|number[]} [attrs.kernel_size] - Size of the convolution kernel
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Conv3D'

    const {
      filters = 1,
      kernel_size = [1, 1, 1],
      strides = [1, 1, 1],
      padding = 'valid',
      data_format = 'channels_last',
      dilation_rate = [1, 1, 1],
      activation = 'linear',
      use_bias = true
    } = attrs

    if (Array.isArray(kernel_size)) {
      this.kernelShape = [filters, ...kernel_size]
    } else {
      this.kernelShape = [filters, kernel_size, kernel_size, kernel_size]
    }

    if (Array.isArray(strides)) {
      this.strides = strides
    } else {
      this.strides = [strides, strides, strides]
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
      this.dilationRate = [dilation_rate, dilation_rate, dilation_rate]
    }
    if (
      (this.dilationRate[0] !== 1 || this.dilationRate[1] !== 1 || this.dilationRate[2] !== 1) &&
      (this.strides[0] !== 1 || this.strides[1] !== 1 || this.strides[2] !== 1)
    ) {
      // Currently, specifying any dilation_rate value != 1 is incompatible with specifying any stride value != 1
      // https://keras.io/layers/convolutional/#conv3d
      this.throwError('Incompatible combination of dilation_rate with strides.')
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
   * In `channels_last` mode, W weight tensor has shape [kernelDim1, kernelDim2, kernelDim3, inputChannels, nbFilter]
   *
   * In `channels_first` mode, W weight tensor has shape [nbFilter, inputChannels, kernelDim1, kernelDim2, kernelDim3]
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    if (this.dataFormat === 'channels_first') {
      weightsArr[0].tensor = weightsArr[0].tensor.transpose(2, 3, 4, 1, 0)
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

    const inputDim1 = inputShape[0]
    const inputDim2 = inputShape[1]
    const inputDim3 = inputShape[2]
    const [nbFilter, kernelDim1, kernelDim2, kernelDim3] = this.kernelShape

    // effective shape after filter dilation
    const kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1)
    const kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1)
    const kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1)

    const outputDim1 =
      this.padding === 'same'
        ? Math.floor((inputDim1 + this.strides[0] - 1) / this.strides[0])
        : Math.floor((inputDim1 - kernelDim1Dilated + this.strides[0]) / this.strides[0])
    const outputDim2 =
      this.padding === 'same'
        ? Math.floor((inputDim2 + this.strides[1] - 1) / this.strides[1])
        : Math.floor((inputDim2 - kernelDim2Dilated + this.strides[1]) / this.strides[1])
    const outputDim3 =
      this.padding === 'same'
        ? Math.floor((inputDim3 + this.strides[2] - 1) / this.strides[2])
        : Math.floor((inputDim3 - kernelDim3Dilated + this.strides[2]) / this.strides[2])
    const outputChannels = nbFilter

    const paddingDim1 =
      this.padding === 'same'
        ? Math.max(0, Math.floor((outputDim1 - 1) * this.strides[0] + kernelDim1Dilated - inputDim1))
        : 0
    const paddingDim2 =
      this.padding === 'same'
        ? Math.max(0, Math.floor((outputDim2 - 1) * this.strides[1] + kernelDim2Dilated - inputDim2))
        : 0
    const paddingDim3 =
      this.padding === 'same'
        ? Math.max(0, Math.floor((outputDim3 - 1) * this.strides[2] + kernelDim3Dilated - inputDim3))
        : 0
    const paddingDim1Before = Math.floor(paddingDim1 / 2)
    const paddingDim1After = paddingDim1 - paddingDim1Before
    const paddingDim2Before = Math.floor(paddingDim2 / 2)
    const paddingDim2After = paddingDim2 - paddingDim2Before
    const paddingDim3Before = Math.floor(paddingDim3 / 2)
    const paddingDim3After = paddingDim3 - paddingDim3Before

    this.outputShape = [outputDim1, outputDim2, outputDim3, outputChannels]
    this.inputPadding = [
      paddingDim1Before,
      paddingDim1After,
      paddingDim2Before,
      paddingDim2After,
      paddingDim3Before,
      paddingDim3After
    ]
  }

  /**
   * Pad input tensor if necessary, for padding='same'
   *
   * @param {Tensor} x
   * @param {number} [padValue]
   * @returns {Tensor}
   */
  _padInput(x, padValue = 0) {
    if (this.padding === 'same') {
      const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape
      const [
        paddingDim1Before,
        paddingDim1After,
        paddingDim2Before,
        paddingDim2After,
        paddingDim3Before,
        paddingDim3After
      ] = this.inputPadding
      const newDim1 = inputDim1 + paddingDim1Before + paddingDim1After
      const newDim2 = inputDim2 + paddingDim2Before + paddingDim2After
      const newDim3 = inputDim3 + paddingDim3Before + paddingDim3After
      const _x = new Tensor([], [newDim1, newDim2, newDim3, inputChannels])
      if (padValue !== 0) {
        ops.assigns(_x.tensor, padValue)
      }
      ops.assign(
        _x.tensor
          .hi(
            inputDim1 + paddingDim1Before,
            inputDim2 + paddingDim2Before,
            inputDim3 + paddingDim3Before,
            inputChannels
          )
          .lo(paddingDim1Before, paddingDim2Before, paddingDim3Before, 0),
        x.tensor
      )
      return _x
    }
    return x
  }

  /**
   * Convert input volume to column matrix
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */
  _vol2col(x) {
    const [inputDim1, inputDim2, inputDim3, inputChannels] = x.tensor.shape
    const kernelDim1 = this.kernelShape[1]
    const kernelDim2 = this.kernelShape[2]
    const kernelDim3 = this.kernelShape[3]
    const outputDim1 = this.outputShape[0]
    const outputDim2 = this.outputShape[1]
    const outputDim3 = this.outputShape[2]
    const nbPatches = outputDim1 * outputDim2 * outputDim3
    const patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels

    // effective shape after filter dilation
    const kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1)
    const kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1)
    const kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1)

    if (!this.volColsMat) {
      this.volColsMat = new Tensor([], [nbPatches, patchLen])
    }

    if (
      kernelDim1Dilated === 1 &&
      kernelDim2Dilated === 1 &&
      kernelDim3Dilated === 1 &&
      this.strides[0] === 1 &&
      this.strides[1] === 1 &&
      this.strides[2] === 1
    ) {
      this.volColsMat.replaceTensorData(x.tensor.data)
      return this.volColsMat
    }

    const patch = new Tensor([], [kernelDim1, kernelDim2, kernelDim3, inputChannels])
    let offset = 0
    for (let i = 0, limit = inputDim1 - kernelDim1Dilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputDim2 - kernelDim2Dilated; j <= limit; j += this.strides[1]) {
        for (let k = 0, limit = inputDim3 - kernelDim3Dilated; k <= limit; k += this.strides[2]) {
          ops.assign(
            patch.tensor,
            x.tensor
              .hi(i + kernelDim1Dilated, j + kernelDim2Dilated, k + kernelDim3Dilated, inputChannels)
              .lo(i, j, k, 0)
              .step(this.dilationRate[0], this.dilationRate[1], this.dilationRate[2], 1)
          )
          this.volColsMat.tensor.data.set(patch.tensor.data, offset)
          offset += patchLen
        }
      }
    }

    return this.volColsMat
  }

  /**
   * Convert filter weights to row matrix
   *
   * @returns {Tensor}
   */
  _w2row() {
    const inputChannels = this.weights['kernel'].tensor.shape[3]
    const [nbFilter, kernelDim1, kernelDim2, kernelDim3] = this.kernelShape
    const patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels

    this.wRowsMat = new Tensor([], [patchLen, nbFilter])

    const patch = new Tensor([], [kernelDim1, kernelDim2, kernelDim3, inputChannels])
    const patchRaveled = new Tensor([], [patchLen])
    for (let n = 0; n < nbFilter; n++) {
      ops.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, null, null, n))
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
    this._vol2col(x)

    const nbFilter = this.kernelShape[0]
    const outputDim1 = this.outputShape[0]
    const outputDim2 = this.outputShape[1]
    const outputDim3 = this.outputShape[2]
    const nbPatches = outputDim1 * outputDim2 * outputDim3
    const matMul = new Tensor([], [nbPatches, nbFilter])

    if (this.useBias) {
      for (let n = 0; n < nbFilter; n++) {
        ops.assigns(matMul.tensor.pick(null, n), this.weights['bias'].tensor.get(n))
      }
    }
    gemm(matMul.tensor, this.volColsMat.tensor, this.wRowsMat.tensor, 1, 1)

    this.output = new Tensor([], this.outputShape)

    let outputChannelRaveled = new Tensor([], [outputDim1 * outputDim2 * outputDim3])
    let outputChannel = new Tensor([], [outputDim1, outputDim2, outputDim3])
    for (let n = 0; n < nbFilter; n++) {
      ops.assign(outputChannelRaveled.tensor, matMul.tensor.pick(null, n))
      outputChannel.replaceTensorData(outputChannelRaveled.tensor.data)
      ops.assign(this.output.tensor.pick(null, null, null, n), outputChannel.tensor)
    }

    this.activationFunc(this.output)

    // convert back to channels_first ordering if necessary
    if (this.dataFormat === 'channels_first') {
      this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2)
    }
  }

  /**
   * Creates a index mapping from the 2D-reshaped input tensor with associated 3D tensor shape to the representation
   * required prior to the matrix multiply. This allows us to work directly on the 2D reshaped tensor representations
   * rather than needing to reshape to the 3D reprentation and calling im2col.
   *
   * @param {Object} indicesForReshaped
   */
  _createIndexMap(indicesForReshaped) {
    if (this.indexMap) {
      return
    }

    let [inputDim1, inputDim2, inputDim3, inputChannels] = this.inputShape

    let indices = new Tensor(indicesForReshaped.data, indicesForReshaped.shape, { type: Int32Array })

    // padding for border mode 'same'
    if (this.padding === 'same') {
      const [
        paddingDim1Before,
        paddingDim1After,
        paddingDim2Before,
        paddingDim2After,
        paddingDim3Before,
        paddingDim3After
      ] = this.inputPadding
      inputDim1 = inputDim1 + paddingDim1Before + paddingDim1After
      inputDim2 = inputDim2 + paddingDim2Before + paddingDim2After
      inputDim3 = inputDim3 + paddingDim3Before + paddingDim3After
      const padValue = -1
      indices = this._padInput(indices, padValue)
    }

    const kernelDim1 = this.kernelShape[1]
    const kernelDim2 = this.kernelShape[2]
    const kernelDim3 = this.kernelShape[3]
    const outputDim1 = this.outputShape[0]
    const outputDim2 = this.outputShape[1]
    const outputDim3 = this.outputShape[2]
    const nbPatches = outputDim1 * outputDim2 * outputDim3
    const patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels

    // effective shape after filter dilation
    const kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1)
    const kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1)
    const kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1)

    this.indexMap = new Tensor([], [nbPatches, patchLen], { type: Int32Array })

    const indicesPatch = new Tensor([], [kernelDim1, kernelDim2, kernelDim3, inputChannels])
    let offset = 0
    for (let i = 0, limit = inputDim1 - kernelDim1Dilated; i <= limit; i += this.strides[0]) {
      for (let j = 0, limit = inputDim2 - kernelDim2Dilated; j <= limit; j += this.strides[1]) {
        for (let k = 0, limit = inputDim3 - kernelDim3Dilated; k <= limit; k += this.strides[2]) {
          ops.assign(
            indicesPatch.tensor,
            indices.tensor
              .hi(i + kernelDim1Dilated, j + kernelDim2Dilated, k + kernelDim3Dilated, inputChannels)
              .lo(i, j, k, 0)
              .step(this.dilationRate[0], this.dilationRate[1], this.dilationRate[2], 1)
          )
          this.indexMap.tensor.data.set(indicesPatch.tensor.data, offset)
          offset += patchLen
        }
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
      this._vol2col(x)
      this.volColsMat.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      outputTextureShape = [this.volColsMat.glTextureShape[0], this.weights['kernel'].glTextureShape[1]]
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
      // run matrix multiply on result of vol2col
      const matMulInputs = [{ input: this.volColsMat, name: 'A' }, { input: this.weights['kernel'], name: 'B' }]
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
        this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2)
      }
    }
  }
}
