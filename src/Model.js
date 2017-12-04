import Promise from 'bluebird'
import axios from 'axios'
import _ from 'lodash'
import now from 'performance-now'
import * as layers from './layers'
import * as visMethods from './visualizations'
import Tensor from './Tensor'
import { webgl2 } from './WebGL2'
import proto from './proto'

const axiosSource = axios.CancelToken.source()

/**
 * Model class
 */
export default class Model {
  /**
   * Create new Model class
   *
   * @param {string} config.filepath - path to protobuf-serialized model definition file
   * @param {Object} [config.headers] - any additional HTTP headers required for resource fetching
   * @param {Object} [config.filesystem] - specifies that data files are from local file system (Node.js only)
   * @param {boolean} [config.gpu] - enable GPU
   * @param {boolean} [config.transferLayerOutputs] - in GPU mode, transfer outputs of each layer from GPU->CPU (warning: decreases performance)
   * @param {boolean} [config.pauseAfterLayerCalls] - break up blocking computation by layer, to allow for intervening DOM updates, for example
   * @param {string[]} [config.visualizations] - specifies which visualizations to calculate
   */
  constructor(config = {}) {
    const {
      filepath = null,
      headers = {},
      filesystem = false,
      gpu = false,
      transferLayerOutputs = false,
      pauseAfterLayerCalls = false,
      visualizations = []
    } = config

    if (!filepath) {
      throw new Error('[Model] path to protobuf-serialized model definition file is missing.')
    }
    this.filepath = filepath

    // HTTP(S) headers used during data fetching
    this.headers = headers

    // specifies that data files are from local file system (Node.js only)
    this.filesystem = typeof window !== 'undefined' ? false : filesystem

    // data request progress
    this.dataRequestProgress = 0

    // Model config
    this.id = null
    this.name = null
    this.kerasVersion = null
    this.backend = null
    this.modelConfig = {}
    this.modelWeights = []

    // flag to enable GPU where possible (disable in node environment)
    this.gpu = typeof window !== 'undefined' && webgl2.isSupported ? gpu : false

    // in GPU mode, transfer intermediate outputs of each layer from GPU->CPU
    this.transferLayerOutputs = transferLayerOutputs

    // break up blocking computation by layer, to allow for intervening DOM updates, for example
    this.pauseAfterLayerCalls = pauseAfterLayerCalls

    // map of model layers
    this.modelLayersMap = new Map()

    // map of input tensors
    this.inputTensorsMap = new Map()

    // names of input and output layers
    this.inputLayerNames = []
    this.outputLayerNames = []

    // array of model layer names with finished output
    this.finishedLayerNames = []

    // flag while computations are being performed
    this.isRunning = false

    // stats object for last `predict` call
    this.predictStats = {}

    // visualizations to calculate
    this.visMap = new Map()
    visualizations.forEach(v => {
      if (v in visMethods) {
        const visInstance = new visMethods[v]({ modelLayersMap: this.modelLayersMap, gpu: this.gpu })
        this.visMap.set(v, visInstance)
      }
    })

    // Promise for when Model class is initialized
    this._ready = this._initialize()
  }

  /**
   * Checks whether WebGL 2 is supported by browser
   */
  checkGPUSupport() {
    return webgl2.isSupported
  }

  /**
   * Promise for when model data is loaded and layers are initialized.
   *
   * @returns {Promise}
   */
  ready() {
    return this._ready
  }

  /**
   * Cancels any existing data requests
   */
  _interrupt() {
    axiosSource.cancel()
  }

  /**
   * Model initialization
   *
   * @returns {Promise}
   */
  async _initialize() {
    try {
      const req = this.filesystem ? this._dataRequestFS() : this._dataRequestHTTP(this.headers)
      await req
    } catch (err) {
      console.log(err)
      this._interrupt()
    }

    // build directed acyclic graph
    this._buildDAG()

    // run predict once with initial empty input tensors to cache variables such as shape inference
    this.inputLayerNames.forEach(name => {
      const inputLayer = this.modelLayersMap.get(name)
      inputLayer.call(this.inputTensorsMap.get(name))
      inputLayer.hasOutput = true
      inputLayer.visited = true
    })
    await this._traverseDAG(this.inputLayerNames)

    // reset hasOutput and visited flags in all layers
    this.finishedLayerNames = []
    this.modelLayersMap.forEach(layer => {
      layer.hasOutput = false
      layer.visited = false
    })

    // initialize visualizations
    this.visMap.forEach(visInstance => {
      visInstance.initialize()
    })

    return true
  }

  /**
   * Makes data HTTP request (browser or node)
   *
   * @param {Object} [headers] - any headers to be passed along with request
   * @returns {Promise}
   */
  async _dataRequestHTTP(headers = {}) {
    try {
      const res = await axios.get(this.filepath, {
        responseType: 'arraybuffer',
        headers,
        onDownloadProgress: e => {
          if (e.lengthComputable) {
            const percentComplete = Math.round(100 * e.loaded / e.total)
            this.dataRequestProgress = percentComplete
          }
        },
        cancelToken: axiosSource.token
      })

      this.decodeProtobuf(new Uint8Array(res.data))
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('[Model] Data request canceled', err.message)
      } else {
        throw err
      }
    }

    this.dataRequestProgress = 100
  }

  /**
   * Makes data FS request (node only)
   *
   * @returns {Promise}
   */
  async _dataRequestFS() {
    const readFile = Promise.promisify(require('fs').readFile)

    try {
      const file = await readFile(this.filepath)
      this.decodeProtobuf(file)
    } catch (err) {
      throw err
    }

    this.dataRequestProgress = 100
  }

  /**
   * Verifies and decodes binary buffer representing protobuf-serialized model definition file.
   *
   * @param {Uint8Array|Buffer} buffer
   */
  decodeProtobuf(buffer) {
    const err = proto.Model.verify(buffer)
    if (err) {
      throw new Error(`[Model] Invalid model - check protobuf serialization: {err}`)
    }
    const model = proto.Model.decode(buffer)
    this.id = model.id
    this.name = model.name
    this.kerasVersion = model.kerasVersion
    this.backend = model.backend
    this.modelConfig = JSON.parse(model.modelConfig)
    this.modelWeights = model.modelWeights
  }

  /**
   * Loading progress calculated from all the data requests combined.
   * @returns {number}
   */
  getLoadingProgress() {
    return this.dataRequestProgress
  }

  /**
   * Toggle GPU mode on/off
   * Iterate through all layers and set `gpu` attribute
   * @param {boolean} mode - on/off
   */
  toggleGPU(mode) {
    if (typeof mode === 'undefined') {
      this.gpu = !this.gpu
    } else {
      this.gpu = mode
    }
    this.modelLayersMap.forEach(layer => {
      layer.toggleGPU(this.gpu)
    })
    this.visMap.forEach(visInstance => {
      visInstance.gpu = this.gpu
    })
    this.resetInputTensors()
  }

  /**
   * Resets input tensors
   */
  resetInputTensors() {
    this.inputLayerNames.forEach(name => {
      const inputLayer = this.modelLayersMap.get(name)
      this.inputTensorsMap.set(name, new Tensor([], inputLayer.shape))
    })
  }

  /**
   * Builds directed acyclic graph of model layers
   *
   * Every layer in the model defines inbound and outbound nodes. For Keras models of class Sequential, we still convert
   * the list into DAG format for straightforward interoperability with graph models (however, we must first create an
   * Input layer as the initial layer. For class Model, the DAG is constructed from the configuration inbound and
   * outbound nodes. Note that Models can have layers be entire Sequential branches.
   */
  _buildDAG() {
    const modelClass = this.modelConfig.class_name

    let modelConfig = []
    if (modelClass === 'Sequential') {
      modelConfig = this.modelConfig.config
    } else if (modelClass === 'Model') {
      modelConfig = this.modelConfig.config.layers
    }

    if (!(Array.isArray(modelConfig) && modelConfig.length)) {
      throw new Error('[Model] Model configuration does not contain any layers.')
    }

    modelConfig.forEach((layerDef, index) => {
      const layerClass = layerDef.class_name
      const layerConfig = layerDef.config

      if (modelClass === 'Model' && layerClass === 'Sequential') {
        // when layer is a Sequential branch in a Model
        layerConfig.forEach((branchLayerDef, branchIndex) => {
          const branchLayerClass = branchLayerDef.class_name
          const branchLayerConfig = branchLayerDef.config

          const branchInboundLayerNames =
            branchIndex === 0
              ? layerDef.inbound_nodes[0].map(node => node[0])
              : [layerConfig[branchIndex - 1].config.name]

          this._createLayer(branchLayerClass, branchLayerConfig, branchInboundLayerNames)
        })
      } else if (!(layerClass in layers)) {
        throw new Error(`[Model] Layer ${layerClass} specified in model configuration is not implemented!`)
      } else {
        // create InputLayer node for Sequential class (which is not explicitly defined in config)
        // create input tensor for InputLayer specified in Model class (layer itself created later)
        if (modelClass === 'Sequential' && index === 0) {
          const inputName = 'input'
          const inputShape = layerConfig.batch_input_shape.slice(1)
          const layer = new layers.InputLayer({ name: inputName, shape: inputShape, gpu: this.gpu })
          this.modelLayersMap.set(inputName, layer)
          this.inputTensorsMap.set(inputName, new Tensor([], inputShape))
          this.inputLayerNames.push(inputName)
        } else if (modelClass === 'Model' && layerClass === 'InputLayer') {
          const inputShape = layerConfig.batch_input_shape.slice(1)
          this.inputTensorsMap.set(layerConfig.name, new Tensor([], inputShape))
          this.inputLayerNames.push(layerConfig.name)
        }

        let inboundLayerNames = []
        if (modelClass === 'Sequential') {
          if (index === 0) {
            inboundLayerNames = ['input']
          } else {
            inboundLayerNames = [modelConfig[index - 1].config.name]
          }
        } else if (modelClass === 'Model') {
          const inboundNodes = layerDef.inbound_nodes
          if (inboundNodes && inboundNodes.length) {
            inboundLayerNames = inboundNodes[0].map(node => node[0])
          }
        }
        this._createLayer(layerClass, layerConfig, inboundLayerNames)
      }
    })

    this.modelLayersMap.forEach(layer => {
      if (layer.outbound.length === 0) {
        this.outputLayerNames.push(layer.name)
      }
    })

    this.inputLayerNames.sort()
    this.outputLayerNames.sort()
  }

  /**
   * Create single layer
   *
   * @param {Object} layerClass
   * @param {Object} layerConfig
   * @param {string[]} inboundLayerNames
   */
  _createLayer(layerClass, layerConfig, inboundLayerNames) {
    const layer = new layers[layerClass](Object.assign({}, layerConfig, { gpu: this.gpu }))

    // layer weights
    let weightNames = []
    if (layerClass === 'Bidirectional') {
      const forwardWeightNames = layer.forwardLayer.params.map(
        param => `${layerConfig.name}/forward_${layerConfig.layer.config.name}/${param}`
      )
      const backwardWeightNames = layer.backwardLayer.params.map(
        param => `${layerConfig.name}/backward_${layerConfig.layer.config.name}/${param}`
      )
      weightNames = forwardWeightNames.concat(backwardWeightNames)
    } else if (layerClass === 'TimeDistributed') {
      weightNames = layer.layer.params.map(param => `${layerConfig.name}/${param}`)
    } else {
      weightNames = layer.params.map(param => `${layerConfig.name}/${param}`)
    }

    if (weightNames && weightNames.length) {
      const weights = weightNames.map(weightName => {
        const weightDef = _.find(this.modelWeights, w => {
          const weightRE = new RegExp(`^${weightName}`)
          return weightRE.test(w.weightName)
        })

        if (!weightDef) {
          throw new Error(`[Model] error loading weights.`)
        }

        const { data, shape, type } = weightDef

        // need to make a copy of underlying ArrayBuffer
        const buf = new ArrayBuffer(data.byteLength)
        const arr = new Uint8Array(buf)
        arr.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength))

        if (type === 'uint8') {
          // weights are quantized
          const { quantizeMin, quantizeMax } = weightDef
          const unquantized = new Float32Array(arr)
          for (let i = 0, len = unquantized.length; i < len; i++) {
            unquantized[i] *= (quantizeMax - quantizeMin) / 255
            unquantized[i] += quantizeMin
          }
          return new Tensor(unquantized, shape)
        } else {
          return new Tensor(new Float32Array(buf), shape)
        }
      })

      layer.setWeights(weights)
    }

    this.modelLayersMap.set(layerConfig.name, layer)

    inboundLayerNames.forEach(layerName => {
      this.modelLayersMap.get(layerConfig.name).inbound.push(layerName)
      this.modelLayersMap.get(layerName).outbound.push(layerConfig.name)
    })
  }

  /**
   * Async function for recursively traversing the DAG
   * Graph object is stored in `this.modelDAG`, keyed by layer name.
   * Layers are retrieved from Map object `this.modelLayersMap`.
   *
   * @param {string[]} nodes - array of layer names
   * @returns {Promise}
   */
  async _traverseDAG(nodes) {
    if (nodes.length === 0) {
      // Stopping criterion:
      // an output node will have 0 outbound nodes.
      return true
    } else if (nodes.length === 1) {
      // Where computational logic lives for a given layer node
      // - Makes sure outputs are available from inbound layer nodes
      // - Keeps async function going until outputs are available from inbound layer nodes
      //   (important for merge layer nodes where multiple inbound nodes may complete asynchronously)
      // - Runs computation for current layer node: .call()
      // - Starts new async function for outbound nodes
      const node = nodes[0]
      const currentLayer = this.modelLayersMap.get(node)

      if (currentLayer.layerClass === 'InputLayer') {
        this.finishedLayerNames.push(this.modelLayersMap.get(node).name)
      } else {
        const currentLayer = this.modelLayersMap.get(node)
        if (currentLayer.visited) {
          return false
        }

        const inboundLayers = currentLayer.inbound.map(n => this.modelLayersMap.get(n))
        if (!_.every(_.map(inboundLayers, 'hasOutput'))) {
          return false
        }

        if (currentLayer.isMergeLayer) {
          currentLayer.call(_.map(inboundLayers, 'output'))
        } else {
          currentLayer.call(inboundLayers[0].output)
        }

        currentLayer.hasOutput = true
        currentLayer.visited = true
        this.finishedLayerNames.push(currentLayer.name)

        if (this.pauseAfterLayerCalls) {
          await Promise.delay(0)
        }
      }

      await this._traverseDAG(currentLayer.outbound)
    } else {
      await Promise.all(nodes.map(node => this._traverseDAG([node])))
    }
  }

  /**
   * Transfer intermediate outputs if specified, only in GPU mode and if transferLayerOutputs is set to true
   */
  _maybeTransferIntermediateOutputs() {
    if (this.gpu && this.transferLayerOutputs) {
      this.modelLayersMap.forEach(layer => {
        if (layer.output && layer.output.glTexture) {
          webgl2.bindOutputTexture(layer.output.glTexture, layer.output.glTextureShape)
          layer.output.transferFromGLTexture()
          if (layer.output.is2DReshaped) {
            layer.output.reshapeFrom2D()
          }
        }
      })
    }
  }

  /**
   * Load data to input layer nodes
   *
   * @param {Object} inputData - object where the keys are the named inputs of the model,
   * and values the TypedArray numeric data
   */
  loadData(inputData) {
    this.inputLayerNames.forEach(name => {
      const inputLayer = this.modelLayersMap.get(name)
      this.inputTensorsMap.get(name).replaceTensorData(inputData[name])
      inputLayer.call(this.inputTensorsMap.get(name))
      inputLayer.hasOutput = true
      inputLayer.visited = true
    })
  }

  /**
   * Predict
   *
   * @param {Object} inputData - object where the keys are the named inputs of the model,
   * and values the TypedArray numeric data
   * @returns {Promise} - outputData object where the keys are the named outputs of the model,
   * and values the TypedArray numeric data
   */
  async predict(inputData) {
    this.isRunning = true

    if (!_.isEqual(_.keys(inputData).sort(), this.inputLayerNames)) {
      this.isRunning = false
      throw new Error(
        '[Model] predict() must take an object where the keys are the named inputs of the model: ' +
          JSON.stringify(this.inputLayerNames)
      )
    }
    if (!_.every(this.inputLayerNames, name => inputData[name] instanceof Float32Array)) {
      this.isRunning = false
      throw new Error('[Model] predict() must take an object where the values are the flattened data as Float32Array.')
    }

    // reset hasOutput and visited flags in all layers
    this.finishedLayerNames = []
    this.modelLayersMap.forEach(layer => {
      layer.hasOutput = false
      layer.visited = false
    })

    // load data to input tensors
    let start = now()
    this.loadData(inputData)
    this.predictStats.loadData = now() - start

    // start traversing DAG at inputs
    start = now()
    await this._traverseDAG(this.inputLayerNames)
    this.predictStats.forwardPass = now() - start

    // transfer intermediate outputs if specified
    this._maybeTransferIntermediateOutputs()

    // outputs are layers with no outbound nodes
    const modelClass = this.modelConfig.class_name
    const outputData = {}
    if (modelClass === 'Sequential') {
      const outputLayer = this.modelLayersMap.get(this.outputLayerNames[0])
      outputData['output'] = outputLayer.output.tensor.data
    } else if (modelClass === 'Model') {
      this.outputLayerNames.forEach(layerName => {
        const outputLayer = this.modelLayersMap.get(layerName)
        outputData[layerName] = outputLayer.output.tensor.data
      })
    }

    // update visualizations
    start = now()
    this.visMap.forEach(visInstance => {
      visInstance.update()
    })
    this.predictStats.visualizations = now() - start

    this.isRunning = false
    return outputData
  }

  /**
   * Run computation on a specific layer
   *
   * @param {string} layerName
   * @param {Tensor|Object} input - can be Tensor instance or ndarray object
   */
  layerCall(layerName, input) {
    if (!this.modelLayersMap.has(layerName)) return

    let x
    if (input instanceof Tensor) {
      x = input
    } else {
      x = new Tensor(input.data, input.shape)
    }
    const layer = this.modelLayersMap.get(layerName)
    return layer.call(x)
  }

  /**
   * Cleanup - important for memory management
   */
  cleanup() {
    // delete references to WebGL textures and buffers to free up GPU memory
    webgl2.clearRefs()

    // Maps must be manually cleared so that values may be garbage collected
    this.modelLayersMap.clear()
    this.inputTensorsMap.clear()
    this.visMap.clear()

    // delete reference to model weights object
    delete this.modelWeights
  }
}
