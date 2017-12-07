import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import { relu } from '../../activations'
import programSource from './LeakyReLU.glsl'

/**
 * LeakyReLU advanced activation layer class
 */
export default class LeakyReLU extends Layer {
  /**
   * Creates a LeakyReLU activation layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.alpha] - negative slope coefficient
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'LeakyReLU'

    const { alpha = 0.3 } = attrs

    this.alpha = alpha

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
    this.output = x
    relu(this.output, { alpha: this.alpha })
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      x.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
    }

    if (!this.output) {
      this.output = new Tensor([], x.glTextureShape)
      this.output.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      if (x.is1D) {
        this.output.is1D = x.is1D
      } else if (x.is2DReshaped || x.is2DSquareReshaped) {
        if (x.is2DReshaped) {
          this.output.is2DReshaped = x.is2DReshaped
        } else if (x.is2DSquareReshaped) {
          this.output.is2DSquareReshaped = x.is2DSquareReshaped
        }
        this.output.originalShape = x.originalShape
        this.output.indicesForReshaped = x.indicesForReshaped
      }
    }

    webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{ input: x, name: 'x' }],
      uniforms: [{ value: this.alpha, type: 'float', name: 'alpha' }],
      supportsTextureFragments: true
    })

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
      if (this.output.is2DReshaped) {
        this.output.reshapeFrom2D()
      } else if (this.output.is2DSquareReshaped) {
        this.output.reshapeFrom2DSquare()
      }
    }
  }
}
