import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import mapInputProgramSource from '../../webgl/mapInput.glsl'

/**
 * Cropping3D layer class
 */
export default class Cropping3D extends Layer {
  /**
   * Creates a Cropping3D layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number|number[]|number[][]} [attrs.cropping] - int, or tuple of 2 ints, or tuple of 2 tuples of 2 ints
   * @param {string} [attrs.data_format] - either 'channels_last' or 'channels_first'
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Cropping3D'

    const { cropping = [[0, 0], [0, 0], [0, 0]], data_format = 'channels_last' } = attrs

    if (Array.isArray(cropping)) {
      if (Array.isArray(cropping[0])) {
        // [[int, int], [int, int], [int, int]]
        this.cropping = cropping
      } else {
        // [int, int, int]
        this.cropping = [[cropping[0], cropping[0]], [cropping[1], cropping[1]], [cropping[2], cropping[2]]]
      }
    } else {
      // int
      this.cropping = [[cropping, cropping], [cropping, cropping], [cropping, cropping]]
    }

    this.dataFormat = data_format

    // GPU setup
    if (this.gpu) {
      this.mapInputProgram = webgl2.compileProgram(mapInputProgramSource)
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
    // convert to channels_last ordering if necessary
    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(1, 2, 3, 0)
    }

    this.inputShape = x.tensor.shape
    this.outputShape = [
      this.inputShape[0] - this.cropping[0][0] - this.cropping[0][1],
      this.inputShape[1] - this.cropping[1][0] - this.cropping[1][1],
      this.inputShape[2] - this.cropping[2][0] - this.cropping[2][1],
      this.inputShape[3]
    ]
    this.output = new Tensor([], this.outputShape)
    ops.assign(
      this.output.tensor,
      x.tensor
        .hi(
          this.inputShape[0] - this.cropping[0][1],
          this.inputShape[1] - this.cropping[1][1],
          this.inputShape[2] - this.cropping[2][1],
          this.inputShape[3]
        )
        .lo(this.cropping[0][0], this.cropping[1][0], this.cropping[2][0], 0)
    )

    // convert back to channels_first ordering if necessary
    if (this.dataFormat === 'channels_first') {
      x.tensor = x.tensor.transpose(3, 0, 1, 2)
      this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2)
    }
  }

  /**
   * Creates row/col index mappings to map input texture to output texture
   *
   * @param {Object} indicesForReshaped
   */
  _createIndexMap(indicesForReshaped) {
    if (this.indexMap) {
      return
    }

    const indices = new Tensor(indicesForReshaped.data, indicesForReshaped.shape, { type: Int32Array })

    this.indexMap = new Tensor([], this.outputShape, { type: Int32Array })

    const sliceStart =
      this.dataFormat === 'channels_first'
        ? [0, this.cropping[0][0], this.cropping[1][0], this.cropping[2][0]]
        : [this.cropping[0][0], this.cropping[1][0], this.cropping[2][0], 0]
    const sliceEnd =
      this.dataFormat === 'channels_first'
        ? [
            this.inputShape[0],
            this.inputShape[1] - this.cropping[0][1],
            this.inputShape[2] - this.cropping[1][1],
            this.inputShape[3] - this.cropping[2][1]
          ]
        : [
            this.inputShape[0] - this.cropping[0][1],
            this.inputShape[1] - this.cropping[1][1],
            this.inputShape[2] - this.cropping[2][1],
            this.inputShape[3]
          ]

    ops.assign(this.indexMap.tensor, indices.tensor.hi(...sliceEnd).lo(...sliceStart))

    this.indexMap.reshapeTo2DSquare()
    this.indexMap.createGLTexture({ type: '2d', format: 'int' })
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture) {
      x.reshapeTo2DSquare()
      x.createGLTexture({ type: '2d', format: 'float' })
    }
    this.inputShape = x.originalShape
    this.outputShape =
      this.dataFormat === 'channels_first'
        ? [
            this.inputShape[0],
            this.inputShape[1] - this.cropping[0][0] - this.cropping[0][1],
            this.inputShape[2] - this.cropping[1][0] - this.cropping[1][1],
            this.inputShape[3] - this.cropping[2][0] - this.cropping[2][1]
          ]
        : [
            this.inputShape[0] - this.cropping[0][0] - this.cropping[0][1],
            this.inputShape[1] - this.cropping[1][0] - this.cropping[1][1],
            this.inputShape[2] - this.cropping[2][0] - this.cropping[2][1],
            this.inputShape[3]
          ]

    this._createIndexMap(x.indicesForReshaped)

    if (!this.output) {
      this.output = new Tensor([], this.outputShape)
      this.output.reshapeTo2DSquare()
      this.output.createGLTexture({ type: '2d', format: 'float' })
    }

    webgl2.runProgram({
      program: this.mapInputProgram,
      output: this.output,
      inputs: [{ input: x, name: 'x' }, { input: this.indexMap, name: 'indexMap' }],
      uniforms: [{ value: x.glTextureShape[1], type: 'int', name: 'inputCols' }]
    })

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
      this.output.reshapeFrom2DSquare()
    }
  }
}
