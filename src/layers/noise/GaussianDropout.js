import Layer from '../../Layer'

/**
 * GaussianDropout layer class
 * Note that this layer is here only for compatibility purposes,
 * as it's only active during training phase.
 */
export default class GaussianDropout extends Layer {
  /**
   * Creates a GaussianDropout layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.rate] - fraction of the input units to drop (between 0 and 1)
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GaussianDropout'

    const { rate = 0.5 } = attrs

    this.rate = Math.min(Math.max(0, rate), 1)
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
