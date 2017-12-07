import _GlobalPooling1D from './_GlobalPooling1D'

/**
 * GlobalAveragePooling1D layer class, extends abstract _GlobalPooling1D class
 */
export default class GlobalAveragePooling1D extends _GlobalPooling1D {
  /**
   * Creates a GlobalAveragePooling1D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GlobalAveragePooling1D'

    this.poolingFunc = 'average'
  }
}
