import _GlobalPooling3D from './_GlobalPooling3D'

/**
 * GlobalMaxPooling3D layer class, extends abstract _GlobalPooling3D class
 */
export default class GlobalMaxPooling3D extends _GlobalPooling3D {
  /**
   * Creates a GlobalMaxPooling3D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GlobalMaxPooling3D'

    this.poolingFunc = 'max'
  }
}
