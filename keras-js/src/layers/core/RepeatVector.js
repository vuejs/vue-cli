import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import unsqueeze from 'ndarray-unsqueeze'
import tile from 'ndarray-tile'
import programSource from './RepeatVector.glsl'

/**
 * RepeatVector layer class
 * Turns 2D tensors of shape [features] to 3D tensors of shape [n, features].
 * Note there is no concept of batch size in these layers (single-batch) so we're actually going from 1D to 2D.
 */
export default class RepeatVector extends Layer {
  /**
   * Creates a RepeatVector layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.n]
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'RepeatVector'

    const { n = 1 } = attrs
    this.n = n

    // GPU setup
    if (this.gpu) {
      this.program = webgl2.compileProgram(programSource)
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
   * CPU call
   *
   * @param {Tensor} x
   */
  _callCPU(x) {
    if (x.tensor.shape.length !== 1) {
      this.throwError('Only 1D tensor inputs allowed.')
    }
    this.output = new Tensor([], [this.n, x.tensor.shape[1]])
    this.output.tensor = tile(unsqueeze(x.tensor, 0), [this.n, 1])
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

    if (!this.output) {
      this.output = new Tensor([], [this.n, x.glTextureShape[1]])
      this.output.createGLTexture({ type: '2d', format: 'float' })
    }

    webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{ input: x, name: 'x' }]
    })

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
