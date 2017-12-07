import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import programSource from './BatchNormalization.glsl'

/**
 * BatchNormalization layer class
 */
export default class BatchNormalization extends Layer {
  /**
   * Creates an BatchNormalization layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'BatchNormalization'

    const { epsilon = 0.001, axis = -1, center = true, scale = true } = attrs

    this.epsilon = epsilon
    this.center = center
    this.scale = scale

    // no batch axis, so axis is less 1 compared to representation in keras
    // will be set in call(), as input tensor shape is needed to calculate axis
    // if axis < 0
    this.axis = axis
    this.axisNormalized = false

    // Layer weights specification
    this.params = []
    if (this.scale) {
      this.params.push('gamma')
    }
    if (this.center) {
      this.params.push('beta')
    }
    this.params = this.params.concat(['moving_mean', 'moving_variance'])

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
    if (!this.axisNormalized) {
      this.axis = this.axis < 0 ? x.tensor.shape.length + this.axis : this.axis - 1
      this.axisNormalized = true
    }

    let broadcast = []
    for (let d = 0; d < x.tensor.shape.length; d++) {
      if (d === this.axis) broadcast.push(1)
      else broadcast.push(null)
    }

    // broadcast weights
    let _gamma = new Tensor([], x.tensor.shape)
    let _beta = new Tensor([], x.tensor.shape)
    for (let i = 0; i < x.tensor.shape[this.axis]; i++) {
      broadcast[this.axis] = i
      if (this.scale) {
        ops.assigns(_gamma.tensor.pick(...broadcast), this.weights['gamma'].tensor.get(i))
      }
      if (this.center) {
        ops.assigns(_beta.tensor.pick(...broadcast), this.weights['beta'].tensor.get(i))
      }
    }

    let _mean = new Tensor([], x.tensor.shape)
    let _std = new Tensor([], x.tensor.shape)

    // feature-wise normalization
    for (let i = 0; i < x.tensor.shape[this.axis]; i++) {
      broadcast[this.axis] = i
      ops.assigns(_mean.tensor.pick(...broadcast), this.weights['moving_mean'].tensor.get(i))
      ops.assigns(_std.tensor.pick(...broadcast), this.weights['moving_variance'].tensor.get(i) + this.epsilon)
    }
    ops.sqrteq(_std.tensor)

    this.output = new Tensor(x.tensor.data, x.tensor.shape)

    ops.subeq(this.output.tensor, _mean.tensor)
    ops.diveq(this.output.tensor, _std.tensor)
    if (this.scale) {
      ops.muleq(this.output.tensor, _gamma.tensor)
    }
    if (this.center) {
      ops.addeq(this.output.tensor, _beta.tensor)
    }
  }

  /**
   * Pre-compute index maps for GPU batchnorm function
   *
   * @param {number[]} glTextureShape
   * @param {Object} indicesForReshaped
   */
  _createIndexMap(glTextureShape, indicesForReshaped) {
    if (this.normAxisIndexMap) {
      return
    }

    const _normAxisIndexMap = new Tensor([], this.inputShape, { type: Int32Array })
    this.normAxisIndexMap = new Tensor([], glTextureShape, { type: Int32Array })

    const slice = Array(this.inputShape.length).fill(null)
    for (let i = 0; i < this.inputShape[this.axis]; i++) {
      slice[this.axis] = i
      ops.assigns(_normAxisIndexMap.tensor.pick(...slice), i)
    }

    if (indicesForReshaped) {
      for (let i = 0; i < indicesForReshaped.data.length; i++) {
        this.normAxisIndexMap.tensor.data[indicesForReshaped.data[i]] = _normAxisIndexMap.tensor.data[i]
      }
    } else {
      this.normAxisIndexMap = _normAxisIndexMap
    }

    this.normAxisIndexMap.createGLTexture({ type: '2d', format: 'int', supportsTextureFragments: true })
  }

  /**
   * GPU call
   * (will only work on the 2D-reshaped representation for post-convolutional BN)
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!this.axisNormalized) {
      if (x.is2DReshaped || x.is2DSquareReshaped) {
        this.inputShape = x.originalShape
      } else {
        this.inputShape = x.tensor.shape
      }
      this.axis = this.axis < 0 ? this.inputShape.length + this.axis : this.axis - 1
      this.axisNormalized = true
    }

    if (!x.glTexture && !x.glTextureFragments) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      } else if (x.tensor.shape.length > 2 && !x.is2DReshaped) {
        x.reshapeTo2DSquare()
        x.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      }
    }

    this._createIndexMap(x.glTextureShape, x.indicesForReshaped)

    // create output textures if doesn't already exist
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

    const programInputs = [{ input: x, name: 'X' }, { input: this.normAxisIndexMap, name: 'normAxisIndexMap' }]
    if (this.scale) {
      programInputs.push({ input: this.weights['gamma'], name: 'gamma' })
    }
    if (this.center) {
      programInputs.push({ input: this.weights['beta'], name: 'beta' })
    }
    programInputs.push({ input: this.weights['moving_mean'], name: 'mean' })
    programInputs.push({ input: this.weights['moving_variance'], name: 'std' })
    const programUniforms = [
      { value: this.epsilon, type: 'float', name: 'epsilon' },
      { value: +this.scale, type: 'bool', name: 'scale' },
      { value: +this.center, type: 'bool', name: 'center' }
    ]
    webgl2.runProgram({
      program: this.program,
      output: this.output,
      inputs: programInputs,
      uniforms: programUniforms,
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
