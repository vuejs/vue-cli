import Layer from '../../Layer'

/**
 * GaussianNoise layer class
 * Note that this layer is here only for compatibility purposes,
 * as it's only active during training phase.
 */
export default class GaussianNoise extends Layer {
  /**
   * Creates a GaussianNoise layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.stddev] - standard deviation of the noise distribution
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GaussianNoise'

    const { stddev = 0 } = attrs
    this.stddev = stddev
  }

  /**
   * Method for layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */
  call(x) {
    this.output = x
    return this.output
  }
}
