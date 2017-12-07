import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import * as layers from '../'
import copyTextureProgramSource from '../../webgl/copyTexture.glsl'
import mapInputProgramSource from '../../webgl/mapInput.glsl'
import selectSliceProgramSource from './TimeDistributed.selectSlice.glsl'
import copySliceOutputProgramSource from './TimeDistributed.copySliceOutput.glsl'
import mapSliceOutputProgramSource from './TimeDistributed.mapSliceOutput.glsl'

/**
 * TimeDistributed wrapper layer class
 */
export default class TimeDistributed extends Layer {
  /**
   * Creates a TimeDistributed wrapper layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'TimeDistributed'

    const { layer } = attrs

    if (!layer) {
      this.throwError('wrapped layer is undefined.')
    }

    const wrappedLayerAttrs = Object.assign({}, layer.config, { gpu: attrs.gpu })
    this.wrappedLayer = new layers[layer.class_name](wrappedLayerAttrs)

    // prevent GPU -> CPU data transfer by specifying non-empty outbound nodes array on internal layer
    this.wrappedLayer.outbound = [null]

    // GPU setup
    if (this.gpu) {
      this.copyTextureProgram = webgl2.compileProgram(copyTextureProgramSource)
      this.mapInputProgram = webgl2.compileProgram(mapInputProgramSource)
      this.selectSliceProgram = webgl2.compileProgram(selectSliceProgramSource)
      this.copySliceOutputProgram = webgl2.compileProgram(copySliceOutputProgramSource)
      this.mapSliceOutputProgram = webgl2.compileProgram(mapSliceOutputProgramSource)
    }
  }

  /**
   * Method for setting layer weights
   * Passes weights to the wrapped layer
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    this.wrappedLayer.setWeights(weightsArr)
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
    const stepShape = [...x.tensor.shape.slice(1)]
    const step = new Tensor([], stepShape)
    ops.assign(step.tensor, x.tensor.pick(0, ...Array(stepShape.length).fill(null)))
    let stepOutput = this.wrappedLayer.call(step)
    const stepOutputShape = stepOutput.tensor.shape.slice()
    this.output = new Tensor([], [x.tensor.shape[0], ...stepOutputShape])
    ops.assign(this.output.tensor.pick(0, ...Array(stepOutputShape.length).fill(null)), stepOutput.tensor)
    for (let i = 1, timesteps = x.tensor.shape[0]; i < timesteps; i++) {
      ops.assign(step.tensor, x.tensor.pick(i, ...Array(stepShape.length).fill(null)))
      stepOutput = this.wrappedLayer.call(step)
      ops.assign(this.output.tensor.pick(i, ...Array(stepOutputShape.length).fill(null)), stepOutput.tensor)
    }
  }

  /**
   * Creates row/col index mappings to map input texture to time-distributed slices
   *
   * @param {Object} indicesForReshaped
   */
  _createIndexMap(indicesForReshaped) {
    if (this.indexMaps) {
      return
    }

    const indices = new Tensor(indicesForReshaped.data, indicesForReshaped.shape, { type: Int32Array })

    this.indexMaps = []

    const timesteps = this.inputShape[0]
    const sliceShape = this.inputShape.slice(1)
    for (let t = 0; t < timesteps; t++) {
      const sliceIndices = new Tensor([], sliceShape, { type: Int32Array })
      ops.assign(sliceIndices.tensor, indices.tensor.pick(t, ...Array(sliceShape.length).fill(null)))
      sliceIndices.reshapeTo2DSquare()
      sliceIndices.createGLTexture({ type: '2d', format: 'int' })
      this.indexMaps.push(sliceIndices)
    }
  }

  /**
   * Creates row/col index mappings to map time-distributed slices to output texture
   *
   * @param {Object} indicesForReshaped
   */
  _createOutputIndexMap(indicesForReshaped) {
    if (this.outputIndexMaps) {
      return
    }

    const outputSliceIndices = new Tensor(indicesForReshaped.data, indicesForReshaped.shape, { type: Int32Array })

    this.outputIndexMaps = []

    const timesteps = this.outputShape[0]
    const sliceShape = this.outputShape.slice(1)
    for (let t = 0; t < timesteps; t++) {
      const outputIndices = new Tensor([], this.outputShape, { type: Int32Array })
      ops.assigns(outputIndices.tensor, -1)
      ops.assign(outputIndices.tensor.pick(t, ...Array(sliceShape.length).fill(null)), outputSliceIndices.tensor)
      outputIndices.reshapeTo2DSquare()
      outputIndices.createGLTexture({ type: '2d', format: 'int' })
      this.outputIndexMaps.push(outputIndices)
    }
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (x.is2DReshaped || x.is2DSquareReshaped) {
      this.inputShape = x.originalShape
    } else {
      this.inputShape = x.tensor.shape
    }

    if (!x.glTexture) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({ type: '2d', format: 'float' })
      } else if (x.tensor.shape.length > 2 && !x.is2DReshaped) {
        x.reshapeTo2DSquare()
        x.createGLTexture({ type: '2d', format: 'float' })
      }
    }

    if (this.inputShape.length > 2) {
      this._createIndexMap(x.indicesForReshaped)
    }

    const timesteps = this.inputShape[0]
    const sliceShape = this.inputShape.slice(1)

    if (!this.slice) {
      this.slice = new Tensor([], sliceShape)
      if (sliceShape.length <= 2) {
        this.slice.createGLTexture({ type: '2d', format: 'float' })
      } else {
        this.slice.reshapeTo2DSquare()
        this.slice.createGLTexture({ type: '2d', format: 'float' })
      }
    }

    if (this.inputShape.length <= 2) {
      webgl2.runProgram({
        program: this.selectSliceProgram,
        output: this.slice,
        inputs: [{ input: x, name: 'x' }],
        uniforms: [{ value: 0, type: 'int', name: 't' }]
      })
    } else {
      webgl2.runProgram({
        program: this.mapInputProgram,
        output: this.slice,
        inputs: [{ input: x, name: 'x' }, { input: this.indexMaps[0], name: 'indexMap' }],
        uniforms: [{ value: x.glTextureShape[1], type: 'int', name: 'inputCols' }]
      })
    }

    this.wrappedLayer._callGPU(this.slice)
    this.sliceOutput = this.wrappedLayer.output

    if (!this.output) {
      if (this.inputShape.length <= 2) {
        this.outputShape = [timesteps, this.sliceOutput.glTextureShape[1]]
        this.output = new Tensor([], this.outputShape)
        this.outputCopy = new Tensor([], this.outputShape)
        this.output.createGLTexture({ type: '2d', format: 'float' })
        this.outputCopy.createGLTexture({ type: '2d', format: 'float' })
      } else {
        this.outputShape = [timesteps, ...this.sliceOutput.originalShape]
        this.output = new Tensor([], this.outputShape)
        this.outputCopy = new Tensor([], this.outputShape)
        this.output.reshapeTo2DSquare()
        this.outputCopy.reshapeTo2DSquare()
        this.output.createGLTexture({ type: '2d', format: 'float' })
        this.outputCopy.createGLTexture({ type: '2d', format: 'float' })

        this._createOutputIndexMap(this.sliceOutput.indicesForReshaped)
      }
    }

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.outputCopy,
      inputs: [{ input: this.output, name: 'source' }]
    })

    if (this.inputShape.length <= 2) {
      webgl2.runProgram({
        program: this.copySliceOutputProgram,
        output: this.output,
        inputs: [{ input: this.outputCopy, name: 'outputCopy' }, { input: this.sliceOutput, name: 'sliceOutput' }],
        uniforms: [{ value: 0, type: 'int', name: 't' }, { value: timesteps, type: 'int', name: 'timesteps' }]
      })
    } else {
      webgl2.runProgram({
        program: this.mapSliceOutputProgram,
        output: this.output,
        inputs: [
          { input: this.outputCopy, name: 'outputCopy' },
          { input: this.sliceOutput, name: 'sliceOutput' },
          { input: this.outputIndexMaps[0], name: 'indexMap' }
        ]
      })
    }

    for (let i = 1; i < timesteps; i++) {
      if (this.inputShape.length <= 2) {
        webgl2.runProgram({
          program: this.selectSliceProgram,
          output: this.slice,
          inputs: [{ input: x, name: 'x' }],
          uniforms: [{ value: i, type: 'int', name: 't' }]
        })
      } else {
        webgl2.runProgram({
          program: this.mapInputProgram,
          output: this.slice,
          inputs: [{ input: x, name: 'x' }, { input: this.indexMaps[i], name: 'indexMap' }],
          uniforms: [{ value: x.glTextureShape[1], type: 'int', name: 'inputCols' }]
        })
      }

      this.wrappedLayer._callGPU(this.slice)
      this.sliceOutput = this.wrappedLayer.output

      webgl2.runProgram({
        program: this.copyTextureProgram,
        output: this.outputCopy,
        inputs: [{ input: this.output, name: 'source' }]
      })

      if (this.inputShape.length <= 2) {
        webgl2.runProgram({
          program: this.copySliceOutputProgram,
          output: this.output,
          inputs: [{ input: this.outputCopy, name: 'outputCopy' }, { input: this.sliceOutput, name: 'sliceOutput' }],
          uniforms: [{ value: i, type: 'int', name: 't' }, { value: timesteps, type: 'int', name: 'timesteps' }]
        })
      } else {
        webgl2.runProgram({
          program: this.mapSliceOutputProgram,
          output: this.output,
          inputs: [
            { input: this.outputCopy, name: 'outputCopy' },
            { input: this.sliceOutput, name: 'sliceOutput' },
            { input: this.outputIndexMaps[i], name: 'indexMap' }
          ]
        })
      }
    }

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
