import Layer from '../../Layer'

/**
 * SpatialDropout1D layer class
 * Note that this layer is here only for compatibility purposes,
 * as it's only active during training phase.
 */
export default class SpatialDropout1D extends Layer {
  /**
   * Creates an SpatialDropout1D layer
   *
   * @param {Object} [attrs] - layer config attributes
   * @param {number} [attrs.p] - fraction of the input units to drop (between 0 and 1)
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'SpatialDropout1D'

    const { p = 0.5 } = attrs

    this.p = Math.min(Math.max(0, p), 1)
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
