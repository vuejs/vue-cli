import Layer from '../Layer'
import Tensor from '../Tensor'
import _ from 'lodash'

/**
 * InputLayer layer class
 */
export default class InputLayer extends Layer {
  /**
   * Creates an InputLayer layer
   *
   * @param {Object} [attrs] - layer attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'InputLayer'

    const { shape = [] } = attrs

    this.shape = attrs.batch_input_shape && attrs.batch_input_shape.length ? attrs.batch_input_shape.slice(1) : shape
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
    if (!_.isEqual(this.inputShape, this.shape)) {
      this.throwError(`input tensor shape ${x.tensor.shape} does not match specified shape ${this.shape}.`)
    }
    this.output = new Tensor(x.tensor.data, x.tensor.shape)
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      this.inputShape = x.tensor.shape
    } else {
      if (x.is2DReshaped || x.is2DSquareReshaped) {
        this.inputShape = x.originalShape
      } else {
        this.inputShape = x.tensor.shape
      }
    }

    if (!_.isEqual(this.inputShape, this.shape)) {
      this.throwError(`input tensor shape ${x.tensor.shape} does not match specified shape ${this.shape}.`)
    }

    if (!x.glTexture) {
      if (x.tensor.shape.length <= 2) {
        x.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      } else if (x.tensor.shape.length > 2) {
        x.reshapeTo2D()
        x.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
      }
    }

    this.output = x
  }
}
