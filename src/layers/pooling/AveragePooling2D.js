import _Pooling2D from './_Pooling2D'

/**
 * AveragePooling2D layer class, extends abstract _Pooling2D class
 */
export default class AveragePooling2D extends _Pooling2D {
  /**
   * Creates a AveragePooling2D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'AveragePooling2D'

    this.poolingFunc = 'average'
  }
}
