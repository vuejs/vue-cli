import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import programSource from './Embedding.glsl'

/**
 * Embedding layer class
 */
export default class Embedding extends Layer {
  /**
   * Creates a Embedding layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Embedding'

    const { input_dim = 1, output_dim = 1, input_length = 0, mask_zero = false } = attrs

    this.inputDim = input_dim
    this.outputDim = output_dim
    this.inputLength = input_length

    // mask_zero will be important for subsequent layers
    this.maskZero = mask_zero

    // Layer weights specification
    this.params = ['embeddings']

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
    this.output = new Tensor([], [x.tensor.shape[0], this.weights['embeddings'].tensor.shape[1]])

    for (let i = 0, len = x.tensor.shape[0]; i < len; i++) {
      ops.assign(this.output.tensor.pick(i, null), this.weights['embeddings'].tensor.pick(x.tensor.get(i), null))
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

    if (!this.output) {
      this.output = new Tensor([], [x.glTextureShape[1], this.weights['embeddings'].glTextureShape[1]])
      this.output.createGLTexture({ type: '2d', format: 'float' })
    }

    webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{ input: x, name: 'x' }, { input: this.weights['embeddings'], name: 'embeddings' }]
    })

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
