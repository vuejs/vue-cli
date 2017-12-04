import Tensor from '../Tensor'
import { webgl2 } from '../WebGL2'
import ops from 'ndarray-ops'
import { gemv } from 'ndarray-blas-level2'
import gemm from 'ndarray-gemm'
import createGLSLProgram from '../webgl/dynamic/createGLSLProgram'

/**
 * Class Activation Maps
 */
export default class CAM {
  /**
   * @param {Object} [attrs] - visualization layer attributes
   */
  constructor(attrs = {}) {
    this.modelLayersMap = attrs.modelLayersMap
    this.gpu = attrs.gpu

    if (!this.modelLayersMap) {
      throw new Error(`[CAM] modelLayersMap is required`)
    }
  }

  /**
   * Checks whether CAM can be computed directly (requires GlobalAveragePooling2D layer)
   * Grad-CAM generalizes this to arbitrary architectures, and may be implemented in the future.
   */
  initialize() {
    this.modelLayersMap.forEach(layer => {
      if (layer.layerClass === 'GlobalAveragePooling2D') {
        this.enabled = true
        this.poolLayer = layer
      }
    })

    if (this.enabled && !this.data) {
      // get feature maps from preceding layer
      this.featureMaps = this.modelLayersMap.get(this.poolLayer.inbound[0]).output

      // traverse until we get feature map weights
      // in Inception-V3, for example, this is the kernel weights of the final fully-connected layer
      // in Squeezenet, for example, this is simply the output of the GlobalAveragePooling2D layer
      let weightsFound = false
      let finalLayerReached = false
      let traversingLayer = this.poolLayer
      while (!weightsFound && !finalLayerReached) {
        traversingLayer = this.modelLayersMap.get(traversingLayer.outbound[0])
        if (traversingLayer.weights['kernel']) {
          this.weights = traversingLayer.weights['kernel']
          weightsFound = true
        } else if (!traversingLayer.outbound.length) {
          this.weights = this.poolLayer.output
          finalLayerReached = true
        }
      }

      if (this.featureMaps.is2DReshaped) {
        this.inputShape = this.featureMaps.originalShape.slice(0, 2)
      } else {
        this.inputShape = this.featureMaps.tensor.shape.slice(0, 2)
      }
      if (this.weights.tensor.shape.length === 1) {
        this.shape = this.inputShape
      } else {
        const numOutputClasses = this.weights.tensor.shape[1]
        this.shape = [...this.inputShape, numOutputClasses]
      }
      this.data = new Float32Array(this.shape.reduce((a, b) => a * b, 1))
    }
  }

  /**
   * Update visualization output
   */
  update() {
    if (!this.enabled) return

    // get feature maps from preceding layer
    this.featureMaps = this.modelLayersMap.get(this.poolLayer.inbound[0]).output

    if (this.gpu) {
      this._updateGPU()
    } else {
      this._updateCPU()
    }

    // normalize 0-1
    const outputMin = ops.inf(this.output.tensor)
    const outputMax = ops.sup(this.output.tensor)
    ops.divseq(ops.subseq(this.output.tensor, outputMin), outputMax - outputMin)

    // update data
    this.data = this.output.tensor.data
  }

  _updateCPU() {
    if (!this.featureMaps.is2DReshaped) {
      this.featureMaps.reshapeTo2D()
    }

    if (this.weights.tensor.shape.length === 1) {
      if (!this.output) {
        this.output = new Tensor([], this.shape)
      }
      const matVec = new Tensor([], [this.shape[0] * this.shape[1]])
      gemv(1, this.featureMaps.tensor, this.weights.tensor, 1, matVec.tensor)
      this.output.replaceTensorData(matVec.tensor.data)
    } else {
      if (!this.output) {
        this.output = new Tensor([], this.shape)
      }
      this.output.reshapeTo2D()
      gemm(this.output.tensor, this.featureMaps.tensor, this.weights.tensor, 1, 1)
      this.output.reshapeFrom2D()
    }
    ops.maxseq(this.output.tensor, 0)

    if (this.featureMaps.is2DReshaped) {
      this.featureMaps.reshapeFrom2D()
    }
  }

  _updateGPU() {
    if (!this.output) {
      this.output = new Tensor([], this.shape)
    }

    const isWeights1D = this.weights.is1D

    if (!this.output.glTexture && isWeights1D) {
      this.output.createGLTexture({ type: '2d', format: 'float' })
    } else {
      this.output.reshapeTo2D()
      this.output.createGLTexture({ type: '2d', format: 'float' })
    }

    const numFeatures = isWeights1D ? this.weights.glTextureShape[1] : this.weights.glTextureShape[0]
    if (!this.program) {
      const programSource = createGLSLProgram('cam', this.output.glTextureShape, numFeatures, isWeights1D)
      this.program = webgl2.compileProgram(programSource)
    }
    webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: [{ input: this.featureMaps, name: 'featureMaps' }, { input: this.weights, name: 'weights' }]
    })

    // GPU -> CPU data transfer
    this.output.transferFromGLTexture()
    if (this.output.is2DReshaped) {
      this.output.reshapeFrom2D()
    }
  }
}
