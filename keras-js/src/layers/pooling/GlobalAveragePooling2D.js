import _GlobalPooling2D from './_GlobalPooling2D'

/**
 * GlobalAveragePooling2D layer class, extends abstract _GlobalPooling2D class
 */
export default class GlobalAveragePooling2D extends _GlobalPooling2D {
  /**
   * Creates a GlobalAveragePooling2D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GlobalAveragePooling2D'

    this.poolingFunc = 'average'
  }
}
