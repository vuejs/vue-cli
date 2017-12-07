import _GlobalPooling2D from './_GlobalPooling2D'

/**
 * GlobalMaxPooling2D layer class, extends abstract _GlobalPooling2D class
 */
export default class GlobalMaxPooling2D extends _GlobalPooling2D {
  /**
   * Creates a GlobalMaxPooling2D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GlobalMaxPooling2D'

    this.poolingFunc = 'max'
  }
}
