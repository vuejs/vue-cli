"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _keys2 = _interopRequireDefault(require("lodash/keys"));

var _isEqual2 = _interopRequireDefault(require("lodash/isEqual"));

var _map2 = _interopRequireDefault(require("lodash/map"));

var _every2 = _interopRequireDefault(require("lodash/every"));

var _find2 = _interopRequireDefault(require("lodash/find"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _axios = _interopRequireDefault(require("axios"));

var _performanceNow = _interopRequireDefault(require("performance-now"));

var layers = _interopRequireWildcard(require("./layers"));

var visMethods = _interopRequireWildcard(require("./visualizations"));

var _Tensor = _interopRequireDefault(require("./Tensor"));

var _WebGL = require("./WebGL2");

var _proto = _interopRequireDefault(require("./proto"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const axiosSource = _axios.default.CancelToken.source();

class Model {
  constructor(config = {}) {
    const {
      filepath = null,
      headers = {},
      filesystem = false,
      gpu = false,
      transferLayerOutputs = false,
      pauseAfterLayerCalls = false,
      visualizations = []
    } = config;

    if (!filepath) {
      throw new Error('[Model] path to protobuf-serialized model definition file is missing.');
    }

    this.filepath = filepath;
    this.headers = headers;
    this.filesystem = typeof window !== 'undefined' ? false : filesystem;
    this.dataRequestProgress = 0;
    this.id = null;
    this.name = null;
    this.kerasVersion = null;
    this.backend = null;
    this.modelConfig = {};
    this.modelWeights = [];
    this.gpu = typeof window !== 'undefined' && _WebGL.webgl2.isSupported ? gpu : false;
    this.transferLayerOutputs = transferLayerOutputs;
    this.pauseAfterLayerCalls = pauseAfterLayerCalls;
    this.modelLayersMap = new Map();
    this.inputTensorsMap = new Map();
    this.inputLayerNames = [];
    this.outputLayerNames = [];
    this.finishedLayerNames = [];
    this.isRunning = false;
    this.predictStats = {};
    this.visMap = new Map();
    visualizations.forEach(v => {
      if (v in visMethods) {
        const visInstance = new visMethods[v]({
          modelLayersMap: this.modelLayersMap,
          gpu: this.gpu
        });
        this.visMap.set(v, visInstance);
      }
    });
    this._ready = this._initialize();
  }

  checkGPUSupport() {
    return _WebGL.webgl2.isSupported;
  }

  ready() {
    return this._ready;
  }

  _interrupt() {
    axiosSource.cancel();
  }

  async _initialize() {
    try {
      const req = this.filesystem ? this._dataRequestFS() : this._dataRequestHTTP(this.headers);
      await req;
    } catch (err) {
      console.log(err);

      this._interrupt();
    }

    this._buildDAG();

    this.inputLayerNames.forEach(name => {
      const inputLayer = this.modelLayersMap.get(name);
      inputLayer.call(this.inputTensorsMap.get(name));
      inputLayer.hasOutput = true;
      inputLayer.visited = true;
    });
    await this._traverseDAG(this.inputLayerNames);
    this.finishedLayerNames = [];
    this.modelLayersMap.forEach(layer => {
      layer.hasOutput = false;
      layer.visited = false;
    });
    this.visMap.forEach(visInstance => {
      visInstance.initialize();
    });
    return true;
  }

  async _dataRequestHTTP(headers = {}) {
    try {
      const res = await _axios.default.get(this.filepath, {
        responseType: 'arraybuffer',
        headers,
        onDownloadProgress: e => {
          if (e.lengthComputable) {
            const percentComplete = Math.round(100 * e.loaded / e.total);
            this.dataRequestProgress = percentComplete;
          }
        },
        cancelToken: axiosSource.token
      });
      this.decodeProtobuf(new Uint8Array(res.data));
    } catch (err) {
      if (_axios.default.isCancel(err)) {
        console.log('[Model] Data request canceled', err.message);
      } else {
        throw err;
      }
    }

    this.dataRequestProgress = 100;
  }

  async _dataRequestFS() {
    const readFile = _bluebird.default.promisify(require('fs').readFile);

    try {
      const file = await readFile(this.filepath);
      this.decodeProtobuf(file);
    } catch (err) {
      throw err;
    }

    this.dataRequestProgress = 100;
  }

  decodeProtobuf(buffer) {
    const err = _proto.default.Model.verify(buffer);

    if (err) {
      throw new Error(`[Model] Invalid model - check protobuf serialization: {err}`);
    }

    const model = _proto.default.Model.decode(buffer);

    this.id = model.id;
    this.name = model.name;
    this.kerasVersion = model.kerasVersion;
    this.backend = model.backend;
    this.modelConfig = JSON.parse(model.modelConfig);
    this.modelWeights = model.modelWeights;
  }

  getLoadingProgress() {
    return this.dataRequestProgress;
  }

  toggleGPU(mode) {
    if (typeof mode === 'undefined') {
      this.gpu = !this.gpu;
    } else {
      this.gpu = mode;
    }

    this.modelLayersMap.forEach(layer => {
      layer.toggleGPU(this.gpu);
    });
    this.visMap.forEach(visInstance => {
      visInstance.gpu = this.gpu;
    });
    this.resetInputTensors();
  }

  resetInputTensors() {
    this.inputLayerNames.forEach(name => {
      const inputLayer = this.modelLayersMap.get(name);
      this.inputTensorsMap.set(name, new _Tensor.default([], inputLayer.shape));
    });
  }

  _buildDAG() {
    const modelClass = this.modelConfig.class_name;
    let modelConfig = [];

    if (modelClass === 'Sequential') {
      modelConfig = this.modelConfig.config;
    } else if (modelClass === 'Model') {
      modelConfig = this.modelConfig.config.layers;
    }

    if (!(Array.isArray(modelConfig) && modelConfig.length)) {
      throw new Error('[Model] Model configuration does not contain any layers.');
    }

    modelConfig.forEach((layerDef, index) => {
      const layerClass = layerDef.class_name;
      const layerConfig = layerDef.config;

      if (modelClass === 'Model' && layerClass === 'Sequential') {
        layerConfig.forEach((branchLayerDef, branchIndex) => {
          const branchLayerClass = branchLayerDef.class_name;
          const branchLayerConfig = branchLayerDef.config;
          const branchInboundLayerNames = branchIndex === 0 ? layerDef.inbound_nodes[0].map(node => node[0]) : [layerConfig[branchIndex - 1].config.name];

          this._createLayer(branchLayerClass, branchLayerConfig, branchInboundLayerNames);
        });
      } else if (!(layerClass in layers)) {
        throw new Error(`[Model] Layer ${layerClass} specified in model configuration is not implemented!`);
      } else {
        if (modelClass === 'Sequential' && index === 0) {
          const inputName = 'input';
          const inputShape = layerConfig.batch_input_shape.slice(1);
          const layer = new layers.InputLayer({
            name: inputName,
            shape: inputShape,
            gpu: this.gpu
          });
          this.modelLayersMap.set(inputName, layer);
          this.inputTensorsMap.set(inputName, new _Tensor.default([], inputShape));
          this.inputLayerNames.push(inputName);
        } else if (modelClass === 'Model' && layerClass === 'InputLayer') {
          const inputShape = layerConfig.batch_input_shape.slice(1);
          this.inputTensorsMap.set(layerConfig.name, new _Tensor.default([], inputShape));
          this.inputLayerNames.push(layerConfig.name);
        }

        let inboundLayerNames = [];

        if (modelClass === 'Sequential') {
          if (index === 0) {
            inboundLayerNames = ['input'];
          } else {
            inboundLayerNames = [modelConfig[index - 1].config.name];
          }
        } else if (modelClass === 'Model') {
          const inboundNodes = layerDef.inbound_nodes;

          if (inboundNodes && inboundNodes.length) {
            inboundLayerNames = inboundNodes[0].map(node => node[0]);
          }
        }

        this._createLayer(layerClass, layerConfig, inboundLayerNames);
      }
    });
    this.modelLayersMap.forEach(layer => {
      if (layer.outbound.length === 0) {
        this.outputLayerNames.push(layer.name);
      }
    });
    this.inputLayerNames.sort();
    this.outputLayerNames.sort();
  }

  _createLayer(layerClass, layerConfig, inboundLayerNames) {
    const layer = new layers[layerClass](Object.assign({}, layerConfig, {
      gpu: this.gpu
    }));
    let weightNames = [];

    if (layerClass === 'Bidirectional') {
      const forwardWeightNames = layer.forwardLayer.params.map(param => `${layerConfig.name}/forward_${layerConfig.layer.config.name}/${param}`);
      const backwardWeightNames = layer.backwardLayer.params.map(param => `${layerConfig.name}/backward_${layerConfig.layer.config.name}/${param}`);
      weightNames = forwardWeightNames.concat(backwardWeightNames);
    } else if (layerClass === 'TimeDistributed') {
      weightNames = layer.layer.params.map(param => `${layerConfig.name}/${param}`);
    } else {
      weightNames = layer.params.map(param => `${layerConfig.name}/${param}`);
    }

    if (weightNames && weightNames.length) {
      const weights = weightNames.map(weightName => {
        const weightDef = (0, _find2.default)(this.modelWeights, w => {
          const weightRE = new RegExp(`^${weightName}`);
          return weightRE.test(w.weightName);
        });

        if (!weightDef) {
          throw new Error(`[Model] error loading weights.`);
        }

        const {
          data,
          shape,
          type
        } = weightDef;
        const buf = new ArrayBuffer(data.byteLength);
        const arr = new Uint8Array(buf);
        arr.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));

        if (type === 'uint8') {
          const {
            quantizeMin,
            quantizeMax
          } = weightDef;
          const unquantized = new Float32Array(arr);

          for (let i = 0, len = unquantized.length; i < len; i++) {
            unquantized[i] *= (quantizeMax - quantizeMin) / 255;
            unquantized[i] += quantizeMin;
          }

          return new _Tensor.default(unquantized, shape);
        } else {
          return new _Tensor.default(new Float32Array(buf), shape);
        }
      });
      layer.setWeights(weights);
    }

    this.modelLayersMap.set(layerConfig.name, layer);
    inboundLayerNames.forEach(layerName => {
      this.modelLayersMap.get(layerConfig.name).inbound.push(layerName);
      this.modelLayersMap.get(layerName).outbound.push(layerConfig.name);
    });
  }

  async _traverseDAG(nodes) {
    if (nodes.length === 0) {
      return true;
    } else if (nodes.length === 1) {
      const node = nodes[0];
      const currentLayer = this.modelLayersMap.get(node);

      if (currentLayer.layerClass === 'InputLayer') {
        this.finishedLayerNames.push(this.modelLayersMap.get(node).name);
      } else {
        const currentLayer = this.modelLayersMap.get(node);

        if (currentLayer.visited) {
          return false;
        }

        const inboundLayers = currentLayer.inbound.map(n => this.modelLayersMap.get(n));

        if (!(0, _every2.default)((0, _map2.default)(inboundLayers, 'hasOutput'))) {
          return false;
        }

        if (currentLayer.isMergeLayer) {
          currentLayer.call((0, _map2.default)(inboundLayers, 'output'));
        } else {
          currentLayer.call(inboundLayers[0].output);
        }

        currentLayer.hasOutput = true;
        currentLayer.visited = true;
        this.finishedLayerNames.push(currentLayer.name);

        if (this.pauseAfterLayerCalls) {
          await _bluebird.default.delay(0);
        }
      }

      await this._traverseDAG(currentLayer.outbound);
    } else {
      await _bluebird.default.all(nodes.map(node => this._traverseDAG([node])));
    }
  }

  _maybeTransferIntermediateOutputs() {
    if (this.gpu && this.transferLayerOutputs) {
      this.modelLayersMap.forEach(layer => {
        if (layer.output && layer.output.glTexture) {
          _WebGL.webgl2.bindOutputTexture(layer.output.glTexture, layer.output.glTextureShape);

          layer.output.transferFromGLTexture();

          if (layer.output.is2DReshaped) {
            layer.output.reshapeFrom2D();
          }
        }
      });
    }
  }

  loadData(inputData) {
    this.inputLayerNames.forEach(name => {
      const inputLayer = this.modelLayersMap.get(name);
      this.inputTensorsMap.get(name).replaceTensorData(inputData[name]);
      inputLayer.call(this.inputTensorsMap.get(name));
      inputLayer.hasOutput = true;
      inputLayer.visited = true;
    });
  }

  async predict(inputData) {
    this.isRunning = true;

    if (!(0, _isEqual2.default)((0, _keys2.default)(inputData).sort(), this.inputLayerNames)) {
      this.isRunning = false;
      throw new Error('[Model] predict() must take an object where the keys are the named inputs of the model: ' + JSON.stringify(this.inputLayerNames));
    }

    if (!(0, _every2.default)(this.inputLayerNames, name => inputData[name] instanceof Float32Array)) {
      this.isRunning = false;
      throw new Error('[Model] predict() must take an object where the values are the flattened data as Float32Array.');
    }

    this.finishedLayerNames = [];
    this.modelLayersMap.forEach(layer => {
      layer.hasOutput = false;
      layer.visited = false;
    });
    let start = (0, _performanceNow.default)();
    this.loadData(inputData);
    this.predictStats.loadData = (0, _performanceNow.default)() - start;
    start = (0, _performanceNow.default)();
    await this._traverseDAG(this.inputLayerNames);
    this.predictStats.forwardPass = (0, _performanceNow.default)() - start;

    this._maybeTransferIntermediateOutputs();

    const modelClass = this.modelConfig.class_name;
    const outputData = {};

    if (modelClass === 'Sequential') {
      const outputLayer = this.modelLayersMap.get(this.outputLayerNames[0]);
      outputData['output'] = outputLayer.output.tensor.data;
    } else if (modelClass === 'Model') {
      this.outputLayerNames.forEach(layerName => {
        const outputLayer = this.modelLayersMap.get(layerName);
        outputData[layerName] = outputLayer.output.tensor.data;
      });
    }

    start = (0, _performanceNow.default)();
    this.visMap.forEach(visInstance => {
      visInstance.update();
    });
    this.predictStats.visualizations = (0, _performanceNow.default)() - start;
    this.isRunning = false;
    return outputData;
  }

  layerCall(layerName, input) {
    if (!this.modelLayersMap.has(layerName)) return;
    let x;

    if (input instanceof _Tensor.default) {
      x = input;
    } else {
      x = new _Tensor.default(input.data, input.shape);
    }

    const layer = this.modelLayersMap.get(layerName);
    return layer.call(x);
  }

  cleanup() {
    _WebGL.webgl2.clearRefs();

    this.modelLayersMap.clear();
    this.inputTensorsMap.clear();
    this.visMap.clear();
    delete this.modelWeights;
  }

}

exports.default = Model;