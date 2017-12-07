import _Pooling3D from './_Pooling3D'

/**
 * AveragePooling3D layer class, extends abstract _Pooling3D class
 */
export default class AveragePooling3D extends _Pooling3D {
  /**
   * Creates a AveragePooling3D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'AveragePooling3D'

    this.poolingFunc = 'average'
  }
}
