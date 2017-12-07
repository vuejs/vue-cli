import _GlobalPooling3D from './_GlobalPooling3D'

/**
 * GlobalAveragePooling3D layer class, extends abstract _GlobalPooling3D class
 */
export default class GlobalAveragePooling3D extends _GlobalPooling3D {
  /**
   * Creates a GlobalAveragePooling3D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GlobalAveragePooling3D'

    this.poolingFunc = 'average'
  }
}
