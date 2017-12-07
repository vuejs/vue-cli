import * as activations from '../../activations'
import Tensor from '../../Tensor'
import Layer from '../../Layer'
import { webgl2 } from '../../WebGL2'
import { gemv } from 'ndarray-blas-level2'
import ops from 'ndarray-ops'
import cwise from 'cwise'
import copyTextureProgramSource from '../../webgl/copyTexture.glsl'
import matMulProgramSource from '../../webgl/matMul.glsl'
import * as activationProgramSources from '../../activations/programSources'
import gateSummationProgramSource from './gateSummation.glsl'
import gateProductProgramSource from './gateProduct.glsl'
import timestepReadProgramSource from './timestepRead.glsl'
import timestepWriteProgramSource from './timestepWrite.glsl'
import updateProgramSource from './GRU.update.glsl'

/**
 * GRU layer class
 */
export default class GRU extends Layer {
  /**
   * Creates a GRU layer
   *
   * @param {Object} [attrs] - layer attributes
   * @param {number} [attrs.units] - output dimensionality
   * @param {number} [attrs.activation] - activation function
   * @param {number} [attrs.recurrent_activation] - inner activation function
   * @param {number} [attrs.use_bias] - use bias
   * @param {number} [attrs.return_sequences] - return the last output in the output sequence or the full sequence
   * @param {number} [attrs.go_backwards] - process the input sequence backwards
   * @param {number} [attrs.stateful] - whether to save the last state as the initial state for the next pass
   */
  constructor(attrs = {}) {
    super(attrs)
    this.layerClass = 'GRU'

    const {
      units = 1,
      activation = 'tanh',
      use_bias = true,
      recurrent_activation = 'hard_sigmoid',
      return_sequences = false,
      go_backwards = false,
      stateful = false
    } = attrs

    this.units = units

    // keep this.activation and this.recurrentActivation for Bidirectional wrapper layer to use
    this.activation = activation
    this.recurrentActivation = recurrent_activation
    this.activationFunc = activations[activation]
    this.recurrentActivationFunc = activations[recurrent_activation]

    this.use_bias = use_bias

    this.returnSequences = return_sequences
    this.goBackwards = go_backwards
    this.stateful = stateful

    // Layer weights specification
    this.params = this.use_bias ? ['kernel', 'recurrent_kernel', 'bias'] : ['kernel', 'recurrent_kernel']

    // GPU setup
    if (this.gpu) {
      this.copyTextureProgram = webgl2.compileProgram(copyTextureProgramSource)
      this.matMulProgram = webgl2.compileProgram(matMulProgramSource)
      this.activationProgram = webgl2.compileProgram(activationProgramSources[this.activation])
      this.recurrentActivationProgram = webgl2.compileProgram(activationProgramSources[this.recurrentActivation])
      this.gateSummationProgram = webgl2.compileProgram(gateSummationProgramSource)
      this.gateProductProgram = webgl2.compileProgram(gateProductProgramSource)
      this.timestepReadProgram = webgl2.compileProgram(timestepReadProgramSource)
      this.timestepWriteProgram = webgl2.compileProgram(timestepWriteProgramSource)
      this.updateProgram = webgl2.compileProgram(updateProgramSource)
    }
  }

  /**
   * Method for setting layer weights. Extends `super` method.
   *
   * W weight tensor is split into W_z, W_r, W_h
   *
   * U weight tensor is split into U_z, U_r, U_h
   *
   * b weight tensor is split into b_z, b_r, b_h (or create empty bias if this.use_bias is false)
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    super.setWeights(weightsArr)

    const shape_W = this.weights['kernel'].tensor.shape
    this.weights['W_z'] = new Tensor([], [shape_W[0], this.units])
    this.weights['W_r'] = new Tensor([], [shape_W[0], this.units])
    this.weights['W_h'] = new Tensor([], [shape_W[0], this.units])
    ops.assign(this.weights['W_z'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], this.units).lo(0, 0))
    ops.assign(
      this.weights['W_r'].tensor,
      this.weights['kernel'].tensor.hi(shape_W[0], 2 * this.units).lo(0, this.units)
    )
    ops.assign(
      this.weights['W_h'].tensor,
      this.weights['kernel'].tensor.hi(shape_W[0], 3 * this.units).lo(0, 2 * this.units)
    )

    const shape_U = this.weights['recurrent_kernel'].tensor.shape
    this.weights['U_z'] = new Tensor([], [shape_U[0], this.units])
    this.weights['U_r'] = new Tensor([], [shape_U[0], this.units])
    this.weights['U_h'] = new Tensor([], [shape_U[0], this.units])
    ops.assign(this.weights['U_z'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], this.units).lo(0, 0))
    ops.assign(
      this.weights['U_r'].tensor,
      this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 2 * this.units).lo(0, this.units)
    )
    ops.assign(
      this.weights['U_h'].tensor,
      this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 3 * this.units).lo(0, 2 * this.units)
    )

    this.weights['b_z'] = new Tensor([], [this.units])
    this.weights['b_r'] = new Tensor([], [this.units])
    this.weights['b_h'] = new Tensor([], [this.units])
    if (this.use_bias) {
      ops.assign(this.weights['b_z'].tensor, this.weights['bias'].tensor.hi(this.units).lo(0))
      ops.assign(this.weights['b_r'].tensor, this.weights['bias'].tensor.hi(2 * this.units).lo(this.units))
      ops.assign(this.weights['b_h'].tensor, this.weights['bias'].tensor.hi(3 * this.units).lo(2 * this.units))
    }

    if (this.gpu) {
      const names = ['W_z', 'W_r', 'W_h', 'U_z', 'U_r', 'U_h', 'b_z', 'b_r', 'b_h']
      names.forEach(name => {
        this.weights[name].createGLTexture({ type: '2d', format: 'float' })
      })
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

  _combine = cwise({
    args: ['array', 'array', 'array', 'array'],
    body: function(_y, _x1, _x2, _b) {
      _y = _x1 + _x2 + _b
    }
  })

  _update = cwise({
    args: ['array', 'array', 'array'],
    body: function(_h, _htm1, _z) {
      _h = _h * (1 - _z) + _htm1 * _z
    }
  })

  /**
   * CPU call
   *
   * @param {Tensor} x
   */
  _callCPU(x) {
    const dimUpdateGate = this.weights['b_z'].tensor.shape[0]
    const dimResetGate = this.weights['b_r'].tensor.shape[0]
    const dimHiddenState = this.weights['b_h'].tensor.shape[0]

    const currentUpdateGateState = new Tensor([], [dimUpdateGate])
    const tempXZ = new Tensor([], [dimUpdateGate])
    const tempHZ = new Tensor([], [dimUpdateGate])

    const currentResetGateState = new Tensor([], [dimResetGate])
    const tempXR = new Tensor([], [dimResetGate])
    const tempHR = new Tensor([], [dimResetGate])

    const currentHiddenState =
      this.stateful && this.currentHiddenState ? this.currentHiddenState : new Tensor([], [dimHiddenState])
    const tempXH = new Tensor([], [dimHiddenState])
    const tempHH = new Tensor([], [dimHiddenState])
    const previousHiddenState = new Tensor([], [dimHiddenState])

    this.hiddenStateSequence = new Tensor([], [x.tensor.shape[0], dimHiddenState])

    const currentX = new Tensor([], [x.tensor.shape[1]])

    const _step = () => {
      ops.assign(previousHiddenState.tensor, currentHiddenState.tensor)

      gemv(1, this.weights['W_z'].tensor.transpose(1, 0), currentX.tensor, 1, tempXZ.tensor)
      gemv(1, this.weights['U_z'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHZ.tensor)
      this._combine(currentUpdateGateState.tensor, tempXZ.tensor, tempHZ.tensor, this.weights['b_z'].tensor)
      this.recurrentActivationFunc(currentUpdateGateState)

      gemv(1, this.weights['W_r'].tensor.transpose(1, 0), currentX.tensor, 1, tempXR.tensor)
      gemv(1, this.weights['U_r'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHR.tensor)
      this._combine(currentResetGateState.tensor, tempXR.tensor, tempHR.tensor, this.weights['b_r'].tensor)
      this.recurrentActivationFunc(currentResetGateState)

      ops.muleq(currentResetGateState.tensor, previousHiddenState.tensor)
      gemv(1, this.weights['W_h'].tensor.transpose(1, 0), currentX.tensor, 1, tempXH.tensor)
      gemv(1, this.weights['U_h'].tensor.transpose(1, 0), currentResetGateState.tensor, 1, tempHH.tensor)
      this._combine(currentHiddenState.tensor, tempXH.tensor, tempHH.tensor, this.weights['b_h'].tensor)
      this.activationFunc(currentHiddenState)

      this._update(currentHiddenState.tensor, previousHiddenState.tensor, currentUpdateGateState.tensor)
    }

    for (let i = 0, len = x.tensor.shape[0]; i < len; i++) {
      const inputIndex = this.goBackwards ? len - i - 1 : i
      ops.assign(currentX.tensor, x.tensor.pick(inputIndex, null))

      // clear temp tensors
      const tempTensors = [tempXZ, tempHZ, tempXR, tempHR, tempXH, tempHH]
      tempTensors.forEach(temp => ops.assigns(temp.tensor, 0))

      // advance timestep
      _step()

      if (this.returnSequences) {
        ops.assign(this.hiddenStateSequence.tensor.pick(i, null), currentHiddenState.tensor)
      }
    }

    if (this.returnSequences) {
      this.output = this.hiddenStateSequence
    } else {
      this.output = currentHiddenState
    }

    if (this.stateful) {
      this.currentHiddenState = currentHiddenState
    }
  }

  /**
   * Advance time step in _callGPU
   */
  _stepGPU() {
    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.previousHiddenState,
      inputs: [{ input: this.currentHiddenState, name: 'source' }]
    })

    // update gate

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXZ,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_z'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHZ,
      inputs: [{ input: this.previousHiddenState, name: 'A' }, { input: this.weights['U_z'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentUpdateGateStatePreactiv,
      inputs: [
        { input: this.tempXZ, name: 't1' },
        { input: this.tempHZ, name: 't2' },
        { input: this.weights['b_z'], name: 'bias' }
      ]
    })

    if (this.recurrentActivation !== 'linear') {
      webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentUpdateGateState,
        inputs: [{ input: this.currentUpdateGateStatePreactiv, name: 'x' }]
      })
    } else {
      this.currentUpdateGateState = this.currentUpdateGateStatePreactiv
    }

    // reset gate

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXR,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_r'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHR,
      inputs: [{ input: this.previousHiddenState, name: 'A' }, { input: this.weights['U_r'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentResetGateStatePreactiv,
      inputs: [
        { input: this.tempXR, name: 't1' },
        { input: this.tempHR, name: 't2' },
        { input: this.weights['b_r'], name: 'bias' }
      ]
    })

    if (this.recurrentActivation !== 'linear') {
      webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentResetGateState,
        inputs: [{ input: this.currentResetGateStatePreactiv, name: 'x' }]
      })
    } else {
      this.currentResetGateState = this.currentResetGateStatePreactiv
    }

    // hidden state

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.currentResetGateStateCopy,
      inputs: [{ input: this.currentResetGateState, name: 'source' }]
    })

    webgl2.runProgram({
      program: this.gateProductProgram,
      output: this.currentResetGateState,
      inputs: [{ input: this.currentResetGateStateCopy, name: 't1' }, { input: this.previousHiddenState, name: 't2' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXH,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_h'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHH,
      inputs: [{ input: this.currentResetGateState, name: 'A' }, { input: this.weights['U_h'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentHiddenStatePreactiv,
      inputs: [
        { input: this.tempXH, name: 't1' },
        { input: this.tempHH, name: 't2' },
        { input: this.weights['b_h'], name: 'bias' }
      ]
    })

    if (this.activation !== 'linear') {
      webgl2.runProgram({
        program: this.activationProgram,
        output: this.currentHiddenState,
        inputs: [{ input: this.currentHiddenStatePreactiv, name: 'x' }]
      })
    } else {
      this.currentHiddenState = this.currentHiddenStatePreactiv
    }

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.currentHiddenStateCopy,
      inputs: [{ input: this.currentHiddenState, name: 'source' }]
    })

    webgl2.runProgram({
      program: this.updateProgram,
      output: this.currentHiddenState,
      inputs: [
        { input: this.currentHiddenStateCopy, name: 'h' },
        { input: this.previousHiddenState, name: 'htm1' },
        { input: this.currentUpdateGateState, name: 'z' }
      ]
    })
  }

  /**
   * GPU call
   *
   * @param {Tensor} x
   */
  _callGPU(x) {
    if (!x.glTexture) {
      x.createGLTexture({ type: '2d', format: 'float' })
    }

    const dimUpdateGate = this.weights['b_z'].glTextureShape[1]
    const dimResetGate = this.weights['b_r'].glTextureShape[1]
    const dimHiddenState = this.weights['b_h'].glTextureShape[1]

    if (!this.currentHiddenState || !this.stateful) {
      this.currentHiddenState = new Tensor([], [dimHiddenState])
      this.currentHiddenState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentHiddenStateCopy) {
      this.currentHiddenStateCopy = new Tensor([], [dimHiddenState])
      this.currentHiddenStateCopy.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentHiddenStatePreactiv) {
      this.currentHiddenStatePreactiv = new Tensor([], [dimHiddenState])
      this.currentHiddenStatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentUpdateGateState) {
      this.currentUpdateGateState = new Tensor([], [dimUpdateGate])
      this.currentUpdateGateState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentUpdateGateStatePreactiv) {
      this.currentUpdateGateStatePreactiv = new Tensor([], [dimUpdateGate])
      this.currentUpdateGateStatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempXZ) {
      this.tempXZ = new Tensor([], [dimUpdateGate])
      this.tempXZ.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHZ) {
      this.tempHZ = new Tensor([], [dimUpdateGate])
      this.tempHZ.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentResetGateState) {
      this.currentResetGateState = new Tensor([], [dimResetGate])
      this.currentResetGateState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentResetGateStateCopy) {
      this.currentResetGateStateCopy = new Tensor([], [dimResetGate])
      this.currentResetGateStateCopy.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentResetGateStatePreactiv) {
      this.currentResetGateStatePreactiv = new Tensor([], [dimResetGate])
      this.currentResetGateStatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempXR) {
      this.tempXR = new Tensor([], [dimResetGate])
      this.tempXR.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHR) {
      this.tempHR = new Tensor([], [dimResetGate])
      this.tempHR.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.tempXH) {
      this.tempXH = new Tensor([], [dimHiddenState])
      this.tempXH.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHH) {
      this.tempHH = new Tensor([], [dimHiddenState])
      this.tempHH.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.previousHiddenState) {
      this.previousHiddenState = new Tensor([], [dimHiddenState])
      this.previousHiddenState.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.hiddenStateSequence) {
      this.hiddenStateSequence = new Tensor([], [x.glTextureShape[0], dimHiddenState])
      this.hiddenStateSequence.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.hiddenStateSequenceCopy) {
      this.hiddenStateSequenceCopy = new Tensor([], [x.glTextureShape[0], dimHiddenState])
      this.hiddenStateSequenceCopy.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentX) {
      this.currentX = new Tensor([], [x.glTextureShape[1]])
      this.currentX.createGLTexture({ type: '2d', format: 'float' })
    }

    for (let i = 0, len = x.glTextureShape[0]; i < len; i++) {
      const inputIndex = this.goBackwards ? len - i - 1 : i

      webgl2.runProgram({
        program: this.timestepReadProgram,
        output: this.currentX,
        inputs: [{ input: x, name: 'x' }],
        uniforms: [{ value: inputIndex, type: 'int', name: 'index' }]
      })

      this._stepGPU()

      if (this.returnSequences) {
        webgl2.runProgram({
          program: this.copyTextureProgram,
          output: this.hiddenStateSequenceCopy,
          inputs: [{ input: this.hiddenStateSequence, name: 'source' }]
        })
        webgl2.runProgram({
          program: this.timestepWriteProgram,
          output: this.hiddenStateSequence,
          inputs: [{ input: this.currentHiddenState, name: 'x' }, { input: this.hiddenStateSequenceCopy, name: 'y' }],
          uniforms: [{ value: i, type: 'int', name: 'index' }]
        })
      }
    }

    if (this.returnSequences) {
      this.output = this.hiddenStateSequence
    } else {
      this.output = this.currentHiddenState
    }

    // GPU -> CPU data transfer
    if (this.outbound.length === 0) {
      this.output.transferFromGLTexture()
    }
  }
}
