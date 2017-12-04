import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import flattenProgramSource from './Flatten.glsl'
import flattenFragmentsProgramSource from './Flatten.fragments.glsl'

/**
 * Flatten layer class
 * Turns tensor into 1-d. Note there is no concept of batch size in these layers (single-batch).
 */
export default class Flatten extends Layer {
  /**
   * Creates a Flatten layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Flatten'

    // GPU setup
    if (this.gpu) {
      this.flattenProgram = webgl2.compileProgram(flattenProgramSource)
      this.flattenFragmentsProgram = webgl2.compileProgram(flattenFragmentsProgramSource)
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
    if (x.tensor.shape.length <= 1) {
      this.output = x
    } else {
      this.output = new Tensor([], [x.tensor.shape.reduce((a, b) => a * b, 1)])
      this.output.replaceTensorData(x.tensor.data)
    }
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({ type: '2d', format: 'float' })
      } else if (x.tensor.shape.length > 2 && !x.is2DReshaped) {
        x.reshapeTo2D()
        x.createGLTexture({ type: '2d', format: 'float' })
      }
    }

    if (!this.output) {
      this.output = new Tensor([], [x.glTextureShape.reduce((a, b) => a * b, 1)])
      this.output.createGLTexture({ type: '2d', format: 'float' })
    }

    if (x.glTextureFragments) {
      x.convert2DRowFragmentedGLTextureToColStack()
      webgl2.runProgram({
        program: this.flattenFragmentsProgram,
        output: this.output,
        inputs: [{ input: x, name: 'x' }],
        uniforms: [
          { value: this.output.glTextureShape[1], type: 'int', name: 'outputSize' },
          { value: x.glTextureShape[0], type: 'int', name: 'inputRows' },
          { value: x.glTextureShape[1], type: 'int', name: 'inputCols' }
        ],
        supportsTextureFragments: true
      })
      x.removeGLTextureFragmentsAsColStack()
    } else {
      webgl2.runProgram({
        program: this.flattenProgram,
        output: this.output,
        inputs: [{ input: x, name: 'x' }],
        uniforms: [
          { value: this.output.glTextureShape[1], type: 'int', name: 'outputSize' },
          { value: x.glTextureShape[1], type: 'int', name: 'inputCols' }
        ],
        supportsTextureFragments: true
      })
    }

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
