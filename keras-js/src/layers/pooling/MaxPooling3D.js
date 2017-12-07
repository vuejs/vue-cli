import _Pooling3D from './_Pooling3D'

/**
 * MaxPooling3D layer class, extends abstract _Pooling3D class
 */
export default class MaxPooling3D extends _Pooling3D {
  /**
   * Creates a MaxPooling3D layer
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'MaxPooling3D'

    this.poolingFunc = 'max'
  }
}
