import _Merge from './_Merge'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import createGLSLProgram from '../../webgl/dynamic/createGLSLProgram'
import ops from 'ndarray-ops'

/**
 * Maximum merge layer class, extends abstract _Merge class
 */
export default class Maximum extends _Merge {
  /**
   * Creates a Maximum merge layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'Maximum'

    this.mode = 'max'
  }

  /**
   * CPU call
   *
   * @param {Tensor[]} inputs
   */
  _callCPU(inputs) {
    const outputShape = inputs[0].tensor.shape.slice()
    this.output = new Tensor([], outputShape)

    ops.assign(this.output.tensor, inputs[0].tensor)
    for (let i = 1; i < inputs.length; i++) {
      ops.maxeq(this.output.tensor, inputs[i].tensor)
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
      const mergeProgramSource = createGLSLProgram('maximum', inputs.length, shape)
      this.mergeProgram = webgl2.compileProgram(mergeProgramSource)
    }
    super._callGPU(inputs)
  }
}
