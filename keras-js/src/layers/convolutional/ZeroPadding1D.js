import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import mapInputProgramSource from '../../webgl/mapInput.glsl'

/**
 * ZeroPadding1D layer class
 */
export default class ZeroPadding1D extends Layer {
  /**
   * Creates a ZeroPadding1D layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number|number[]} [attrs.padding] - int or tuple of int (length 2)
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'ZeroPadding1D'

    const { padding = [1, 1] } = attrs

    if (Array.isArray(padding)) {
      this.padding = padding
    } else {
      this.padding = [padding, padding]
    }

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
    this.inputShape = x.tensor.shape
    this.outputShape = [this.inputShape[0] + this.padding[0] + this.padding[1], this.inputShape[1]]
    this.output = new Tensor([], this.outputShape)
    ops.assign(
      this.output.tensor.hi(this.inputShape[0] + this.padding[0], this.inputShape[1]).lo(this.padding[0], 0),
      x.tensor
    )
  }

  /**
   * Creates row/col index mappings to map input texture to output texture
   */
  _createIndexMap() {
    if (this.indexMap) {
      return
    }

    const indices = new Tensor([], this.inputShape, { type: Int32Array })
    const indicesRow = new Tensor([], this.inputShape, { type: Int32Array })
    const indicesCol = new Tensor([], this.inputShape, { type: Int32Array })
    for (let i = 0; i < this.inputShape[0]; i++) {
      ops.assigns(indicesRow.tensor.pick(i, null), i)
    }
    for (let j = 0; j < this.inputShape[1]; j++) {
      ops.assigns(indicesCol.tensor.pick(null, j), j)
    }
    // i * cols + j
    ops.muls(indices.tensor, indicesRow.tensor, this.inputShape[1])
    ops.addeq(indices.tensor, indicesCol.tensor)

    this.indexMap = new Tensor([], this.outputShape, { type: Int32Array })
    const sliceStart = [this.padding[0], 0]
    const sliceEnd = [this.inputShape[0] + this.padding[0], this.inputShape[1]]
    ops.assigns(this.indexMap.tensor, -1)
    ops.assign(this.indexMap.tensor.hi(...sliceEnd).lo(...sliceStart), indices.tensor)

    this.indexMap.createGLTexture({ type: '2d', format: 'int' })
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

    this.inputShape = x.tensor.shape
    this.outputShape = [this.inputShape[0] + this.padding[0] + this.padding[1], this.inputShape[1]]
    this._createIndexMap()

    if (!this.output) {
      this.output = new Tensor([], this.outputShape)
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
    }
  }
}
