import _Pooling2D from './_Pooling2D'

/**
 * MaxPooling2D layer class, extends abstract _Pooling2D class
 */
export default class MaxPooling2D extends _Pooling2D {
  /**
   * Creates a MaxPooling2D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'MaxPooling2D'

    this.poolingFunc = 'max'
  }
}
