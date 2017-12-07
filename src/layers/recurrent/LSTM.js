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
import updateProgramSource from './LSTM.update.glsl'

/**
 * LSTM layer class
 */
export default class LSTM extends Layer {
  /**
   * Creates a LSTM layer
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
    this.layerClass = 'LSTM'

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
   * W weight tensor is split into W_i, W_f, W_c, W_o
   *
   * U weight tensor is split into U_i, U_f, U_c, U_o
   *
   * b weight tensor is split into b_i, b_f, b_c, b_o (or create empty bias if this.use_bias is false)
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */
  setWeights(weightsArr) {
    super.setWeights(weightsArr)

    const shape_W = this.weights['kernel'].tensor.shape
    this.weights['W_i'] = new Tensor([], [shape_W[0], this.units])
    this.weights['W_f'] = new Tensor([], [shape_W[0], this.units])
    this.weights['W_c'] = new Tensor([], [shape_W[0], this.units])
    this.weights['W_o'] = new Tensor([], [shape_W[0], this.units])
    ops.assign(this.weights['W_i'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], this.units).lo(0, 0))
    ops.assign(
      this.weights['W_f'].tensor,
      this.weights['kernel'].tensor.hi(shape_W[0], 2 * this.units).lo(0, this.units)
    )
    ops.assign(
      this.weights['W_c'].tensor,
      this.weights['kernel'].tensor.hi(shape_W[0], 3 * this.units).lo(0, 2 * this.units)
    )
    ops.assign(
      this.weights['W_o'].tensor,
      this.weights['kernel'].tensor.hi(shape_W[0], 4 * this.units).lo(0, 3 * this.units)
    )

    const shape_U = this.weights['recurrent_kernel'].tensor.shape
    this.weights['U_i'] = new Tensor([], [shape_U[0], this.units])
    this.weights['U_f'] = new Tensor([], [shape_U[0], this.units])
    this.weights['U_c'] = new Tensor([], [shape_U[0], this.units])
    this.weights['U_o'] = new Tensor([], [shape_U[0], this.units])
    ops.assign(this.weights['U_i'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], this.units).lo(0, 0))
    ops.assign(
      this.weights['U_f'].tensor,
      this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 2 * this.units).lo(0, this.units)
    )
    ops.assign(
      this.weights['U_c'].tensor,
      this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 3 * this.units).lo(0, 2 * this.units)
    )
    ops.assign(
      this.weights['U_o'].tensor,
      this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 4 * this.units).lo(0, 3 * this.units)
    )

    this.weights['b_i'] = new Tensor([], [this.units])
    this.weights['b_f'] = new Tensor([], [this.units])
    this.weights['b_c'] = new Tensor([], [this.units])
    this.weights['b_o'] = new Tensor([], [this.units])
    if (this.use_bias) {
      ops.assign(this.weights['b_i'].tensor, this.weights['bias'].tensor.hi(this.units).lo(0))
      ops.assign(this.weights['b_f'].tensor, this.weights['bias'].tensor.hi(2 * this.units).lo(this.units))
      ops.assign(this.weights['b_c'].tensor, this.weights['bias'].tensor.hi(3 * this.units).lo(2 * this.units))
      ops.assign(this.weights['b_o'].tensor, this.weights['bias'].tensor.hi(4 * this.units).lo(3 * this.units))
    }

    if (this.gpu) {
      const names = ['W_i', 'W_f', 'W_c', 'W_o', 'U_i', 'U_f', 'U_c', 'U_o', 'b_i', 'b_f', 'b_c', 'b_o']
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
    args: ['array', 'array', 'array', 'array'],
    body: function(_c, _ctm1, _i, _f) {
      _c = _c * _i + _ctm1 * _f
    }
  })

  /**
   * CPU call
   *
   * @param {Tensor} x
   */
  _callCPU(x) {
    const dimInputGate = this.weights['b_i'].tensor.shape[0]
    const dimCandidate = this.weights['b_c'].tensor.shape[0]
    const dimForgetGate = this.weights['b_f'].tensor.shape[0]
    const dimOutputGate = this.weights['b_o'].tensor.shape[0]

    const currentInputGateState = new Tensor([], [dimInputGate])
    const tempXI = new Tensor([], [dimInputGate])
    const tempHI = new Tensor([], [dimInputGate])

    const currentForgetGateState = new Tensor([], [dimForgetGate])
    const tempXF = new Tensor([], [dimForgetGate])
    const tempHF = new Tensor([], [dimForgetGate])

    const currentOutputGateState = new Tensor([], [dimOutputGate])
    const tempXO = new Tensor([], [dimOutputGate])
    const tempHO = new Tensor([], [dimOutputGate])

    const currentCandidate = new Tensor([], [dimCandidate])
    const tempXC = new Tensor([], [dimCandidate])
    const tempHC = new Tensor([], [dimCandidate])
    const previousCandidate =
      this.stateful && this.previousCandidate ? this.previousCandidate : new Tensor([], [dimCandidate])

    const currentHiddenState =
      this.stateful && this.currentHiddenState ? this.currentHiddenState : new Tensor([], [dimCandidate])
    const previousHiddenState = new Tensor([], [dimCandidate])

    this.hiddenStateSequence = new Tensor([], [x.tensor.shape[0], dimCandidate])

    const currentX = new Tensor([], [x.tensor.shape[1]])

    const _step = () => {
      ops.assign(previousHiddenState.tensor, currentHiddenState.tensor)

      gemv(1, this.weights['W_i'].tensor.transpose(1, 0), currentX.tensor, 1, tempXI.tensor)
      gemv(1, this.weights['U_i'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHI.tensor)
      this._combine(currentInputGateState.tensor, tempXI.tensor, tempHI.tensor, this.weights['b_i'].tensor)
      this.recurrentActivationFunc(currentInputGateState)

      gemv(1, this.weights['W_f'].tensor.transpose(1, 0), currentX.tensor, 1, tempXF.tensor)
      gemv(1, this.weights['U_f'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHF.tensor)
      this._combine(currentForgetGateState.tensor, tempXF.tensor, tempHF.tensor, this.weights['b_f'].tensor)
      this.recurrentActivationFunc(currentForgetGateState)

      gemv(1, this.weights['W_o'].tensor.transpose(1, 0), currentX.tensor, 1, tempXO.tensor)
      gemv(1, this.weights['U_o'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHO.tensor)
      this._combine(currentOutputGateState.tensor, tempXO.tensor, tempHO.tensor, this.weights['b_o'].tensor)
      this.recurrentActivationFunc(currentOutputGateState)

      gemv(1, this.weights['W_c'].tensor.transpose(1, 0), currentX.tensor, 1, tempXC.tensor)
      gemv(1, this.weights['U_c'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHC.tensor)
      this._combine(currentCandidate.tensor, tempXC.tensor, tempHC.tensor, this.weights['b_c'].tensor)
      this.activationFunc(currentCandidate)

      this._update(
        currentCandidate.tensor,
        previousCandidate.tensor,
        currentInputGateState.tensor,
        currentForgetGateState.tensor
      )

      ops.assign(previousCandidate.tensor, currentCandidate.tensor)

      this.activationFunc(currentCandidate)
      ops.mul(currentHiddenState.tensor, currentOutputGateState.tensor, currentCandidate.tensor)
    }

    for (let i = 0, len = x.tensor.shape[0]; i < len; i++) {
      const inputIndex = this.goBackwards ? len - i - 1 : i
      ops.assign(currentX.tensor, x.tensor.pick(inputIndex, null))

      // clear temp tensors
      const tempTensors = [tempXI, tempHI, tempXF, tempHF, tempXO, tempHO, tempXC, tempHC]
      tempTensors.forEach(temp => ops.assigns(temp.tensor, 0))

      // advance timestep
      _step()

      ops.assign(this.hiddenStateSequence.tensor.pick(i, null), currentHiddenState.tensor)
    }

    if (this.returnSequences) {
      this.output = this.hiddenStateSequence
    } else {
      this.output = currentHiddenState
    }

    if (this.stateful) {
      this.previousCandidate = previousCandidate
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

    // input gate

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXI,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_i'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHI,
      inputs: [{ input: this.previousHiddenState, name: 'A' }, { input: this.weights['U_i'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentInputGateStatePreactiv,
      inputs: [
        { input: this.tempXI, name: 't1' },
        { input: this.tempHI, name: 't2' },
        { input: this.weights['b_i'], name: 'bias' }
      ]
    })

    if (this.recurrentActivation !== 'linear') {
      webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentInputGateState,
        inputs: [{ input: this.currentInputGateStatePreactiv, name: 'x' }]
      })
    } else {
      this.currentInputGateState = this.currentInputGateStatePreactiv
    }

    // forget gate

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXF,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_f'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHF,
      inputs: [{ input: this.previousHiddenState, name: 'A' }, { input: this.weights['U_f'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentForgetGateStatePreactiv,
      inputs: [
        { input: this.tempXF, name: 't1' },
        { input: this.tempHF, name: 't2' },
        { input: this.weights['b_f'], name: 'bias' }
      ]
    })

    if (this.recurrentActivation !== 'linear') {
      webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentForgetGateState,
        inputs: [{ input: this.currentForgetGateStatePreactiv, name: 'x' }]
      })
    } else {
      this.currentForgetGateState = this.currentForgetGateStatePreactiv
    }

    // output gate

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXO,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_o'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHO,
      inputs: [{ input: this.previousHiddenState, name: 'A' }, { input: this.weights['U_o'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentOutputGateStatePreactiv,
      inputs: [
        { input: this.tempXO, name: 't1' },
        { input: this.tempHO, name: 't2' },
        { input: this.weights['b_o'], name: 'bias' }
      ]
    })

    if (this.recurrentActivation !== 'linear') {
      webgl2.runProgram({
        program: this.recurrentActivationProgram,
        output: this.currentOutputGateState,
        inputs: [{ input: this.currentOutputGateStatePreactiv, name: 'x' }]
      })
    } else {
      this.currentOutputGateState = this.currentOutputGateStatePreactiv
    }

    // candidate

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempXC,
      inputs: [{ input: this.currentX, name: 'A' }, { input: this.weights['W_c'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.matMulProgram,
      output: this.tempHC,
      inputs: [{ input: this.previousHiddenState, name: 'A' }, { input: this.weights['U_c'], name: 'B' }],
      uniforms: [{ value: 0, type: 'bool', name: 'addC' }]
    })

    webgl2.runProgram({
      program: this.gateSummationProgram,
      output: this.currentCandidatePreactiv,
      inputs: [
        { input: this.tempXC, name: 't1' },
        { input: this.tempHC, name: 't2' },
        { input: this.weights['b_c'], name: 'bias' }
      ]
    })

    if (this.activation !== 'linear') {
      webgl2.runProgram({
        program: this.activationProgram,
        output: this.currentCandidate,
        inputs: [{ input: this.currentCandidatePreactiv, name: 'x' }]
      })
    } else {
      this.currentCandidate = this.currentCandidatePreactiv
    }

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.currentCandidateCopy,
      inputs: [{ input: this.currentCandidate, name: 'source' }]
    })

    webgl2.runProgram({
      program: this.updateProgram,
      output: this.currentCandidate,
      inputs: [
        { input: this.currentCandidateCopy, name: 'c' },
        { input: this.previousCandidate, name: 'ctm1' },
        { input: this.currentInputGateState, name: 'i' },
        { input: this.currentForgetGateState, name: 'f' }
      ]
    })

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.previousCandidate,
      inputs: [{ input: this.currentCandidate, name: 'source' }]
    })

    webgl2.runProgram({
      program: this.copyTextureProgram,
      output: this.currentCandidatePreactiv,
      inputs: [{ input: this.currentCandidate, name: 'source' }]
    })

    if (this.activation !== 'linear') {
      webgl2.runProgram({
        program: this.activationProgram,
        output: this.currentCandidate,
        inputs: [{ input: this.currentCandidatePreactiv, name: 'x' }]
      })
    } else {
      this.currentCandidate = this.currentCandidatePreactiv
    }

    webgl2.runProgram({
      program: this.gateProductProgram,
      output: this.currentHiddenState,
      inputs: [{ input: this.currentOutputGateState, name: 't1' }, { input: this.currentCandidate, name: 't2' }]
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

    const dimInputGate = this.weights['b_i'].glTextureShape[1]
    const dimCandidate = this.weights['b_c'].glTextureShape[1]
    const dimForgetGate = this.weights['b_f'].glTextureShape[1]
    const dimOutputGate = this.weights['b_o'].glTextureShape[1]

    if (!this.currentInputGateState) {
      this.currentInputGateState = new Tensor([], [dimInputGate])
      this.currentInputGateState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentInputGateStatePreactiv) {
      this.currentInputGateStatePreactiv = new Tensor([], [dimInputGate])
      this.currentInputGateStatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempXI) {
      this.tempXI = new Tensor([], [dimInputGate])
      this.tempXI.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHI) {
      this.tempHI = new Tensor([], [dimInputGate])
      this.tempHI.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentForgetGateState) {
      this.currentForgetGateState = new Tensor([], [dimForgetGate])
      this.currentForgetGateState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentForgetGateStatePreactiv) {
      this.currentForgetGateStatePreactiv = new Tensor([], [dimForgetGate])
      this.currentForgetGateStatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempXF) {
      this.tempXF = new Tensor([], [dimForgetGate])
      this.tempXF.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHF) {
      this.tempHF = new Tensor([], [dimForgetGate])
      this.tempHF.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentOutputGateState) {
      this.currentOutputGateState = new Tensor([], [dimOutputGate])
      this.currentOutputGateState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentOutputGateStatePreactiv) {
      this.currentOutputGateStatePreactiv = new Tensor([], [dimOutputGate])
      this.currentOutputGateStatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempXO) {
      this.tempXO = new Tensor([], [dimOutputGate])
      this.tempXO.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHO) {
      this.tempHO = new Tensor([], [dimOutputGate])
      this.tempHO.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentCandidate) {
      this.currentCandidate = new Tensor([], [dimCandidate])
      this.currentCandidate.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentCandidateCopy) {
      this.currentCandidateCopy = new Tensor([], [dimCandidate])
      this.currentCandidateCopy.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.currentCandidatePreactiv) {
      this.currentCandidatePreactiv = new Tensor([], [dimCandidate])
      this.currentCandidatePreactiv.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempXC) {
      this.tempXC = new Tensor([], [dimCandidate])
      this.tempXC.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.tempHC) {
      this.tempHC = new Tensor([], [dimCandidate])
      this.tempHC.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.previousCandidate || !this.stateful) {
      this.previousCandidate = new Tensor([], [dimCandidate])
      this.previousCandidate.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.currentHiddenState || !this.stateful) {
      this.currentHiddenState = new Tensor([], [dimCandidate])
      this.currentHiddenState.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.previousHiddenState) {
      this.previousHiddenState = new Tensor([], [dimCandidate])
      this.previousHiddenState.createGLTexture({ type: '2d', format: 'float' })
    }

    if (!this.hiddenStateSequence) {
      this.hiddenStateSequence = new Tensor([], [x.glTextureShape[0], dimCandidate])
      this.hiddenStateSequence.createGLTexture({ type: '2d', format: 'float' })
    }
    if (!this.hiddenStateSequenceCopy) {
      this.hiddenStateSequenceCopy = new Tensor([], [x.glTextureShape[0], dimCandidate])
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
