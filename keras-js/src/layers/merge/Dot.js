import _Merge from './_Merge'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import gemm from 'ndarray-gemm'
import ops from 'ndarray-ops'
import mergeProgramSource from './Dot.glsl'

/**
 * Dot merge layer class, extends abstract _Merge class
 */
export default class Dot extends _Merge {
  /**
   * Creates a Dot merge layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Dot'

    this.mode = 'dot'

    const { axes = -1, normalize = false } = attrs

    // no mini-batch axis here, so we subtract 1 if given axis > 0
    if (Array.isArray(axes)) {
      this.dotAxes = [axes[0] <= 0 ? axes[0] : axes[0] - 1, axes[1] <= 0 ? axes[1] : axes[1] - 1]
    } else {
      this.dotAxes = [axes <= 0 ? axes : axes - 1, axes <= 0 ? axes : axes - 1]
    }

    this.normalize = normalize

    // GPU setup
    if (this.gpu) {
      this.mergeProgram = webgl2.compileProgram(mergeProgramSource)
    }
  }

  /**
   * Calculate output shape
   *
   * @param {number[][]} inputShapes
   */
  _calcOutputShape(inputShapes) {
    let shape1 = inputShapes[0].slice()
    let shape2 = inputShapes[1].slice()
    shape1.splice(this.dotAxes[0], 1)
    shape2.splice(this.dotAxes[1], 1)
    this.outputShape = shape1.concat(shape2)
    if (this.outputShape.length === 1) {
      this.outputShape.push(1)
    }
  }

  /**
   * CPU call
   *
   * @param {Tensor[]} inputs
   */
  _callCPU(inputs) {
    this._calcOutputShape([inputs[0].tensor.shape, inputs[1].tensor.shape])
    this.output = new Tensor([], this.outputShape)

    if (inputs[0].tensor.shape.length === 2 && inputs[1].tensor.shape.length === 2) {
      if (this.dotAxes[0] === 0 && this.dotAxes[1] === 0) {
        if (this.normalize) {
          for (let i = 0; i < inputs[0].tensor.shape[1]; i++) {
            ops.divseq(inputs[0].tensor.pick(null, i), ops.norm2(inputs[0].tensor.pick(null, i)))
          }
          for (let i = 0; i < inputs[1].tensor.shape[1]; i++) {
            ops.divseq(inputs[1].tensor.pick(null, i), ops.norm2(inputs[1].tensor.pick(null, i)))
          }
        }
        gemm(this.output.tensor, inputs[0].tensor.transpose(1, 0), inputs[1].tensor)
      } else if (this.dotAxes[0] === 1 && this.dotAxes[1] === 1) {
        if (this.normalize) {
          for (let i = 0; i < inputs[0].tensor.shape[0]; i++) {
            ops.divseq(inputs[0].tensor.pick(i, null), ops.norm2(inputs[0].tensor.pick(i, null)))
          }
          for (let i = 0; i < inputs[1].tensor.shape[0]; i++) {
            ops.divseq(inputs[1].tensor.pick(i, null), ops.norm2(inputs[1].tensor.pick(i, null)))
          }
        }
        gemm(this.output.tensor, inputs[0].tensor, inputs[1].tensor.transpose(1, 0))
      }
    } else {
      this.throwError('dot mode for 3+ dim tensors not yet implemented.')
    }
  }

  /**
   * GPU call
   *
   * @param {Tensor[]} inputs
   */
  _callGPU(inputs) {
    inputs.forEach(input => {
      if (!input.glTexture && !input.glTextureFragments) {
        input.createGLTexture({ type: '2d', format: 'float' })
      }
    })

    this._calcOutputShape([inputs[0].glTextureShape, inputs[1].glTextureShape])

    // create output textures if doesn't already exist
    if (!this.output) {
      this.output = new Tensor([], this.outputShape)
      this.output.createGLTexture({ type: '2d', format: 'float' })
    }

    const commonDim = inputs[0].glTextureShape[this.dotAxes[0]]

    webgl2.runProgram({
      program: this.mergeProgram,
      output: this.output,
      inputs: [{ input: inputs[0], name: 'input1' }, { input: inputs[1], name: 'input2' }],
      uniforms: [
        { value: this.output.glTextureShape[0], type: 'int', name: 'rows' },
        { value: this.output.glTextureShape[1], type: 'int', name: 'cols' },
        { value: this.dotAxes[0], type: 'int', name: 'dotAxis1' },
        { value: this.dotAxes[1], type: 'int', name: 'dotAxis2' },
        { value: commonDim, type: 'int', name: 'commonDim' },
        { value: +this.normalize, type: 'bool', name: 'normalize' }
      ]
    })

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
