import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import * as recurrentLayers from '../recurrent'
import copyTextureProgramSource from '../../webgl/copyTexture.glsl'
import concatMergeProgramSource from './Bidirectional.concat.glsl'
import sumMergeProgramSource from './Bidirectional.sum.glsl'
import mulMergeProgramSource from './Bidirectional.mul.glsl'
import aveMergeProgramSource from './Bidirectional.ave.glsl'

/**
 * Bidirectional wrapper layer class
 */
export default class Bidirectional extends Layer {
  /**
   * Creates a Bidirectional wrapper layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {string} [attrs.merge_mode] - merge mode of component layers
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Bidirectional'

    const { layer, merge_mode = 'concat' } = attrs

    if (!layer) {
      this.throwError('wrapped layer is undefined.')
    }
    if (!['SimpleRNN', 'GRU', 'LSTM'].includes(layer.class_name)) {
      this.throwError(`cannot wrap ${layer.class_name} layer.`)
    }
    if (!['concat', 'sum', 'mul', 'ave'].includes(merge_mode)) {
      this.throwError(`merge_mode ${merge_mode} not supported.`)
    }

    const forwardLayerAttrs = Object.assign({}, layer.config, { gpu: attrs.gpu })
    const backwardLayerAttrs = Object.assign({}, layer.config, { gpu: attrs.gpu })
    backwardLayerAttrs.go_backwards = !backwardLayerAttrs.go_backwards
    this.forwardLayer = new recurrentLayers[layer.class_name](forwardLayerAttrs)
    this.backwardLayer = new recurrentLayers[layer.class_name](backwardLayerAttrs)

    // prevent GPU -> CPU data transfer by specifying non-empty outbound nodes array on internal layers
    this.forwardLayer.outbound = [null]
    this.backwardLayer.outbound = [null]

    this.mergeMode = merge_mode
    this.returnSequences = layer.config.return_sequences

    // GPU setup
    if (this.gpu) {
      this.copyTextureProgram = webgl2.compileProgram(copyTextureProgramSource)
      if (this.mergeMode === 'concat') {
        this.mergeProgram = webgl2.compileProgram(concatMergeProgramSource)
      } else if (this.mergeMode === 'sum') {
        this.mergeProgram = webgl2.compileProgram(sumMergeProgramSource)
      } else if (this.mergeMode === 'mul') {
        this.mergeProgram = webgl2.compileProgram(mulMergeProgramSource)
      } else if (this.mergeMode === 'ave') {
        this.mergeProgram = webgl2.compileProgram(aveMergeProgramSource)
      }
    }
  }

  /**
   * Method for setting layer weights - passes weights to the wrapped layer
   *
   * Here, the weights array is concatenated from the forward layer and the backward layer
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    this.forwardLayer.setWeights(weightsArr.slice(0, weightsArr.length / 2))
    this.backwardLayer.setWeights(weightsArr.slice(weightsArr.length / 2))
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
   * CPU call
   *
   * @param {Tensor} x
   */
  _callCPU(x) {
    this.forwardLayer._callCPU(new Tensor(x.tensor.data, x.tensor.shape))
    this.backwardLayer._callCPU(new Tensor(x.tensor.data, x.tensor.shape))
    const forwardOutput = this.forwardLayer.output
    const backwardOutput = this.backwardLayer.output

    // when returnSequences = true, reverse results of backwardLayer
    if (this.returnSequences) {
      backwardOutput.tensor = backwardOutput.tensor.step(-1)
    }

    const outShape = forwardOutput.tensor.shape.slice()
    if (this.mergeMode === 'concat') {
      outShape[outShape.length - 1] += backwardOutput.tensor.shape[outShape.length - 1]
    }
    this.output = new Tensor([], outShape)

    if (this.mergeMode === 'concat') {
      if (this.returnSequences) {
        ops.assign(this.output.tensor.hi(outShape[0], forwardOutput.tensor.shape[1]).lo(0, 0), forwardOutput.tensor)
        ops.assign(
          this.output.tensor.hi(outShape[0], outShape[1]).lo(0, forwardOutput.tensor.shape[1]),
          backwardOutput.tensor
        )
      } else {
        ops.assign(this.output.tensor.hi(forwardOutput.tensor.shape[0]).lo(0), forwardOutput.tensor)
        ops.assign(this.output.tensor.hi(outShape[0]).lo(forwardOutput.tensor.shape[0]), backwardOutput.tensor)
      }
    } else if (this.mergeMode === 'sum') {
      ops.addeq(this.output.tensor, forwardOutput.tensor)
      ops.addeq(this.output.tensor, backwardOutput.tensor)
    } else if (this.mergeMode === 'mul') {
      ops.assigns(this.output.tensor, 1)
      ops.muleq(this.output.tensor, forwardOutput.tensor)
      ops.muleq(this.output.tensor, backwardOutput.tensor)
    } else if (this.mergeMode === 'ave') {
      ops.addeq(this.output.tensor, forwardOutput.tensor)
      ops.addeq(this.output.tensor, backwardOutput.tensor)
      ops.divseq(this.output.tensor, 2)
    }
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.inputCopy) {
      this.inputCopy = new Tensor([], x.glTextureShape)
      this.inputCopy.createGLTexture({ type: '2d', format: 'float' })
    }

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.inputCopy,
      inputs: [{ input: x, name: 'source' }]
    })

    // run internal component layers
    this.forwardLayer._callGPU(x)
    this.backwardLayer._callGPU(this.inputCopy)
    const forwardOutput = this.forwardLayer.output
    const backwardOutput = this.backwardLayer.output

    const outShape = forwardOutput.glTextureShape.slice()
    if (this.mergeMode === 'concat') {
      outShape[1] += backwardOutput.glTextureShape[1]
    }
    if (!this.output) {
      this.output = new Tensor([], outShape)
      this.output.createGLTexture({ type: '2d', format: 'float' })
      if (!this.returnSequences) {
        this.output.is1D = true
      }
    }

    // merge forward and backward outputs
    webgl2.runProgram({
      program: this.mergeProgram,
      output: this.output,
      inputs: [{ input: forwardOutput, name: 'forward' }, { input: backwardOutput, name: 'backward' }]
    })

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
