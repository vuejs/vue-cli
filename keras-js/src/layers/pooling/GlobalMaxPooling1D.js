import _GlobalPooling1D from './_GlobalPooling1D'

/**
 * GlobalMaxPooling1D layer class, extends abstract _GlobalPooling1D class
 */
export default class GlobalMaxPooling1D extends _GlobalPooling1D {
  /**
   * Creates a GlobalMaxPooling1D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GlobalMaxPooling1D'

    this.poolingFunc = 'max'
  }
}
