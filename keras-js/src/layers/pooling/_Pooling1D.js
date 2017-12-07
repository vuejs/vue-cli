import Layer from '../../Layer'
import Tensor from '../../Tensor'
import { webgl2 } from '../../WebGL2'
import ops from 'ndarray-ops'
import poolingProgramSource from './_Pooling.glsl'
import poolingFragmentsProgramSource from './_Pooling.fragments.glsl'

/**
 * _Pooling1D layer class
 */
export default class _Pooling1D extends Layer {
  /**
   * Creates a _Pooling1D layer
   *
   * @param {Object} [attrs] - layer config attributes
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = '_Pooling1D'

    const { pool_size = 2, strides = null, padding = 'valid' } = attrs

    this.poolSize = pool_size
    this.strides = strides === null ? this.poolSize : strides
    this.padding = padding

    // default pooling function
    // can be `max` or `average`
    this.poolingFunc = 'max'

    // GPU setup
    if (this.gpu) {
      this.poolingProgram = webgl2.compileProgram(poolingProgramSource)
      this.poolingFragmentsProgram = webgl2.compileProgram(poolingFragmentsProgramSource)
    }
  }

  /**
   * Layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */
  call(x) {
    if (this.gpu) {
      this._callGPU(x)
    } else {
      this._callCPU(x)
    }
    return this.output
  }

  /**
   * CPU call
   *
   * @param {Tensor} x
   */
  _callCPU(x) {
    const stepsNew =
      this.padding === 'valid'
        ? Math.floor((x.tensor.shape[0] - this.poolSize + this.strides) / this.strides)
        : Math.floor((x.tensor.shape[0] + this.strides - 1) / this.strides)

    this.output = new Tensor([], [stepsNew, x.tensor.shape[1]])
    const outputStep = new Tensor([], [x.tensor.shape[1]])

    // in padding same, start negative from beyond step 0
    let step =
      this.padding === 'valid'
        ? 0
        : Math.min(0, Math.ceil((x.tensor.shape[0] - (stepsNew - 1) * this.strides - this.poolSize) / 2))

    for (let i = 0; i < stepsNew; i++) {
      let _step = Math.max(0, step)
      let limit = this.poolSize + Math.min(0, step)
      ops.assign(outputStep.tensor, x.tensor.pick(_step, null))

      let count = 1
      for (let j = 1; j < limit; j++) {
        if (_step + j > x.tensor.shape[0] - 1) {
          break
        }
        if (this.poolingFunc === 'max') {
          ops.maxeq(outputStep.tensor, x.tensor.pick(_step + j, null))
        } else if (this.poolingFunc === 'average') {
          ops.addeq(outputStep.tensor, x.tensor.pick(_step + j, null))
        }
        count += 1
      }

      if (this.poolingFunc === 'average') {
        ops.divseq(outputStep.tensor, count)
      }

      ops.assign(this.output.tensor.pick(i, null), outputStep.tensor)
      step += this.strides
    }
  }

  /**
   * Pre-compute index map for GPU pooling function
   */
  _createIndexMap() {
    if (this.poolIndexMap) {
      return
    }

    const stepsNew =
      this.padding === 'valid'
        ? Math.floor((this.inputShape[0] - this.poolSize + this.strides) / this.strides)
        : Math.floor((this.inputShape[0] + this.strides - 1) / this.strides)

    this.outputShape = [stepsNew, this.inputShape[1]]

    this.poolIndexMap = new Tensor([], [stepsNew, this.poolSize], { type: Int32Array })
    ops.assigns(this.poolIndexMap.tensor, -1)

    // in padding same, start negative from beyond step 0
    let step =
      this.padding === 'valid'
        ? 0
        : Math.min(0, Math.ceil((this.inputShape[0] - (stepsNew - 1) * this.strides - this.poolSize) / 2))

    for (let i = 0; i < stepsNew; i++) {
      let _step = Math.max(0, step)
      let limit = this.poolSize + Math.min(0, step)

      let inputIndex = _step
      this.poolIndexMap.tensor.set(i, 0, inputIndex)
      for (let j = 1; j < limit; j++) {
        inputIndex = _step + j
        if (inputIndex <= this.inputShape[0] - 1) {
          this.poolIndexMap.tensor.set(i, j, inputIndex)
        } else {
          break
        }
      }
      step += this.strides
    }

    this.poolIndexMap.createGLTexture({ type: '2d', format: 'int', supportsTextureFragments: true })
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture && !x.glTextureFragments) {
      x.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
    }
    this.inputShape = x.tensor.shape
    this._createIndexMap()

    // create output textures if doesn't already exist
    if (!this.output) {
      this.output = new Tensor([], this.outputShape)
      this.output.createGLTexture({ type: '2d', format: 'float', supportsTextureFragments: true })
    }

    // `true` if max pooling, `false` if average pooling
    const isMaxPooling = this.poolingFunc === 'max'

    const programUniforms = [
      { value: this.output.glTextureShape[1], type: 'int', name: 'channels' },
      { value: this.poolSize, type: 'int', name: 'poolSize' },
      { value: +isMaxPooling, type: 'bool', name: 'isMaxPooling' }
    ]
    if (x.glTextureFragments) {
      x.convert2DRowFragmentedGLTextureToColStack()
      webgl2.runProgram({
        program: this.poolingFragmentsProgram,
        output: this.output,
        inputs: [{ input: x, name: 'x' }, { input: this.poolIndexMap, name: 'poolIndexMap' }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      })
      x.removeGLTextureFragmentsAsColStack()
    } else {
      webgl2.runProgram({
        program: this.poolingProgram,
        output: this.output,
        inputs: [{ input: x, name: 'x' }, { input: this.poolIndexMap, name: 'poolIndexMap' }],
        uniforms: programUniforms,
        supportsTextureFragments: true
      })
    }

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
