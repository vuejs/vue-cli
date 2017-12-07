import _Merge from './_Merge'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import createGLSLProgram from '../../webgl/dynamic/createGLSLProgram'
import ops from 'ndarray-ops'

/**
 * Multiply merge layer class, extends abstract _Merge class
 */
export default class Multiply extends _Merge {
  /**
   * Creates a Multiply merge layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Multiply'

    this.mode = 'mul'
  }

  /**
   * CPU call
   *
   * @param {Tensor[]} inputs
   */
  _callCPU(inputs) {
    const outputShape = inputs[0].tensor.shape.slice()
    this.output = new Tensor([], outputShape)

    ops.assigns(this.output.tensor, 1)
    for (let i = 0; i < inputs.length; i++) {
      ops.muleq(this.output.tensor, inputs[i].tensor)
    }
  }

  /**
   * GPU call
   *
   * @param {Tensor[]} inputs
   */
  _callGPU(inputs) {
    if (!this.mergeProgram) {
      const shape = inputs[0].glTextureFragments ? inputs[0].glTextureFragmentShape : inputs[0].glTextureShape
      const mergeProgramSource = createGLSLProgram('multiply', inputs.length, shape)
      this.mergeProgram = webgl2.compileProgram(mergeProgramSource)
    }
    super._callGPU(inputs)
  }
}
