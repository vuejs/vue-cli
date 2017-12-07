"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Model = exports.Weights = void 0;

var $protobuf = _interopRequireWildcard(require("protobufjs/minimal"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const $Reader = $protobuf.Reader,
      $Writer = $protobuf.Writer,
      $util = $protobuf.util;
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
exports.default = $root;

const Weights = $root.Weights = (() => {
  function Weights(properties) {
    this.shape = [];
    if (properties) for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
  }

  Weights.prototype.layerName = "";
  Weights.prototype.weightName = "";
  Weights.prototype.shape = $util.emptyArray;
  Weights.prototype.type = "";
  Weights.prototype.data = $util.newBuffer([]);
  Weights.prototype.quantizeMin = 0;
  Weights.prototype.quantizeMax = 0;

  Weights.create = function create(properties) {
    return new Weights(properties);
  };

  Weights.encode = function encode(message, writer) {
    if (!writer) writer = $Writer.create();
    if (message.layerName != null && message.hasOwnProperty("layerName")) writer.uint32(10).string(message.layerName);
    if (message.weightName != null && message.hasOwnProperty("weightName")) writer.uint32(18).string(message.weightName);

    if (message.shape != null && message.shape.length) {
      writer.uint32(26).fork();

      for (let i = 0; i < message.shape.length; ++i) writer.uint32(message.shape[i]);

      writer.ldelim();
    }

    if (message.type != null && message.hasOwnProperty("type")) writer.uint32(34).string(message.type);
    if (message.data != null && message.hasOwnProperty("data")) writer.uint32(42).bytes(message.data);
    if (message.quantizeMin != null && message.hasOwnProperty("quantizeMin")) writer.uint32(53).float(message.quantizeMin);
    if (message.quantizeMax != null && message.hasOwnProperty("quantizeMax")) writer.uint32(61).float(message.quantizeMax);
    return writer;
  };

  Weights.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  Weights.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.Weights();

    while (reader.pos < end) {
      let tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.layerName = reader.string();
          break;

        case 2:
          message.weightName = reader.string();
          break;

        case 3:
          if (!(message.shape && message.shape.length)) message.shape = [];

          if ((tag & 7) === 2) {
            let end2 = reader.uint32() + reader.pos;

            while (reader.pos < end2) message.shape.push(reader.uint32());
          } else message.shape.push(reader.uint32());

          break;

        case 4:
          message.type = reader.string();
          break;

        case 5:
          message.data = reader.bytes();
          break;

        case 6:
          message.quantizeMin = reader.float();
          break;

        case 7:
          message.quantizeMax = reader.float();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  };

  Weights.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  Weights.verify = function verify(message) {
    if (typeof message !== "object" || message === null) return "object expected";
    if (message.layerName != null && message.hasOwnProperty("layerName")) if (!$util.isString(message.layerName)) return "layerName: string expected";
    if (message.weightName != null && message.hasOwnProperty("weightName")) if (!$util.isString(message.weightName)) return "weightName: string expected";

    if (message.shape != null && message.hasOwnProperty("shape")) {
      if (!Array.isArray(message.shape)) return "shape: array expected";

      for (let i = 0; i < message.shape.length; ++i) if (!$util.isInteger(message.shape[i])) return "shape: integer[] expected";
    }

    if (message.type != null && message.hasOwnProperty("type")) if (!$util.isString(message.type)) return "type: string expected";
    if (message.data != null && message.hasOwnProperty("data")) if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data))) return "data: buffer expected";
    if (message.quantizeMin != null && message.hasOwnProperty("quantizeMin")) if (typeof message.quantizeMin !== "number") return "quantizeMin: number expected";
    if (message.quantizeMax != null && message.hasOwnProperty("quantizeMax")) if (typeof message.quantizeMax !== "number") return "quantizeMax: number expected";
    return null;
  };

  Weights.fromObject = function fromObject(object) {
    if (object instanceof $root.Weights) return object;
    let message = new $root.Weights();
    if (object.layerName != null) message.layerName = String(object.layerName);
    if (object.weightName != null) message.weightName = String(object.weightName);

    if (object.shape) {
      if (!Array.isArray(object.shape)) throw TypeError(".Weights.shape: array expected");
      message.shape = [];

      for (let i = 0; i < object.shape.length; ++i) message.shape[i] = object.shape[i] >>> 0;
    }

    if (object.type != null) message.type = String(object.type);
    if (object.data != null) if (typeof object.data === "string") $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);else if (object.data.length) message.data = object.data;
    if (object.quantizeMin != null) message.quantizeMin = Number(object.quantizeMin);
    if (object.quantizeMax != null) message.quantizeMax = Number(object.quantizeMax);
    return message;
  };

  Weights.toObject = function toObject(message, options) {
    if (!options) options = {};
    let object = {};
    if (options.arrays || options.defaults) object.shape = [];

    if (options.defaults) {
      object.layerName = "";
      object.weightName = "";
      object.type = "";
      object.data = options.bytes === String ? "" : [];
      object.quantizeMin = 0;
      object.quantizeMax = 0;
    }

    if (message.layerName != null && message.hasOwnProperty("layerName")) object.layerName = message.layerName;
    if (message.weightName != null && message.hasOwnProperty("weightName")) object.weightName = message.weightName;

    if (message.shape && message.shape.length) {
      object.shape = [];

      for (let j = 0; j < message.shape.length; ++j) object.shape[j] = message.shape[j];
    }

    if (message.type != null && message.hasOwnProperty("type")) object.type = message.type;
    if (message.data != null && message.hasOwnProperty("data")) object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
    if (message.quantizeMin != null && message.hasOwnProperty("quantizeMin")) object.quantizeMin = options.json && !isFinite(message.quantizeMin) ? String(message.quantizeMin) : message.quantizeMin;
    if (message.quantizeMax != null && message.hasOwnProperty("quantizeMax")) object.quantizeMax = options.json && !isFinite(message.quantizeMax) ? String(message.quantizeMax) : message.quantizeMax;
    return object;
  };

  Weights.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Weights;
})();

exports.Weights = Weights;

const Model = $root.Model = (() => {
  function Model(properties) {
    this.modelWeights = [];
    if (properties) for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i) if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
  }

  Model.prototype.id = "";
  Model.prototype.name = "";
  Model.prototype.kerasVersion = "";
  Model.prototype.backend = "";
  Model.prototype.modelConfig = "";
  Model.prototype.modelWeights = $util.emptyArray;

  Model.create = function create(properties) {
    return new Model(properties);
  };

  Model.encode = function encode(message, writer) {
    if (!writer) writer = $Writer.create();
    if (message.id != null && message.hasOwnProperty("id")) writer.uint32(10).string(message.id);
    if (message.name != null && message.hasOwnProperty("name")) writer.uint32(18).string(message.name);
    if (message.kerasVersion != null && message.hasOwnProperty("kerasVersion")) writer.uint32(26).string(message.kerasVersion);
    if (message.backend != null && message.hasOwnProperty("backend")) writer.uint32(34).string(message.backend);
    if (message.modelConfig != null && message.hasOwnProperty("modelConfig")) writer.uint32(42).string(message.modelConfig);
    if (message.modelWeights != null && message.modelWeights.length) for (let i = 0; i < message.modelWeights.length; ++i) $root.Weights.encode(message.modelWeights[i], writer.uint32(50).fork()).ldelim();
    return writer;
  };

  Model.encodeDelimited = function encodeDelimited(message, writer) {
    return this.encode(message, writer).ldelim();
  };

  Model.decode = function decode(reader, length) {
    if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.Model();

    while (reader.pos < end) {
      let tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;

        case 2:
          message.name = reader.string();
          break;

        case 3:
          message.kerasVersion = reader.string();
          break;

        case 4:
          message.backend = reader.string();
          break;

        case 5:
          message.modelConfig = reader.string();
          break;

        case 6:
          if (!(message.modelWeights && message.modelWeights.length)) message.modelWeights = [];
          message.modelWeights.push($root.Weights.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  };

  Model.decodeDelimited = function decodeDelimited(reader) {
    if (!(reader instanceof $Reader)) reader = new $Reader(reader);
    return this.decode(reader, reader.uint32());
  };

  Model.verify = function verify(message) {
    if (typeof message !== "object" || message === null) return "object expected";
    if (message.id != null && message.hasOwnProperty("id")) if (!$util.isString(message.id)) return "id: string expected";
    if (message.name != null && message.hasOwnProperty("name")) if (!$util.isString(message.name)) return "name: string expected";
    if (message.kerasVersion != null && message.hasOwnProperty("kerasVersion")) if (!$util.isString(message.kerasVersion)) return "kerasVersion: string expected";
    if (message.backend != null && message.hasOwnProperty("backend")) if (!$util.isString(message.backend)) return "backend: string expected";
    if (message.modelConfig != null && message.hasOwnProperty("modelConfig")) if (!$util.isString(message.modelConfig)) return "modelConfig: string expected";

    if (message.modelWeights != null && message.hasOwnProperty("modelWeights")) {
      if (!Array.isArray(message.modelWeights)) return "modelWeights: array expected";

      for (let i = 0; i < message.modelWeights.length; ++i) {
        let error = $root.Weights.verify(message.modelWeights[i]);
        if (error) return "modelWeights." + error;
      }
    }

    return null;
  };

  Model.fromObject = function fromObject(object) {
    if (object instanceof $root.Model) return object;
    let message = new $root.Model();
    if (object.id != null) message.id = String(object.id);
    if (object.name != null) message.name = String(object.name);
    if (object.kerasVersion != null) message.kerasVersion = String(object.kerasVersion);
    if (object.backend != null) message.backend = String(object.backend);
    if (object.modelConfig != null) message.modelConfig = String(object.modelConfig);

    if (object.modelWeights) {
      if (!Array.isArray(object.modelWeights)) throw TypeError(".Model.modelWeights: array expected");
      message.modelWeights = [];

      for (let i = 0; i < object.modelWeights.length; ++i) {
        if (typeof object.modelWeights[i] !== "object") throw TypeError(".Model.modelWeights: object expected");
        message.modelWeights[i] = $root.Weights.fromObject(object.modelWeights[i]);
      }
    }

    return message;
  };

  Model.toObject = function toObject(message, options) {
    if (!options) options = {};
    let object = {};
    if (options.arrays || options.defaults) object.modelWeights = [];

    if (options.defaults) {
      object.id = "";
      object.name = "";
      object.kerasVersion = "";
      object.backend = "";
      object.modelConfig = "";
    }

    if (message.id != null && message.hasOwnProperty("id")) object.id = message.id;
    if (message.name != null && message.hasOwnProperty("name")) object.name = message.name;
    if (message.kerasVersion != null && message.hasOwnProperty("kerasVersion")) object.kerasVersion = message.kerasVersion;
    if (message.backend != null && message.hasOwnProperty("backend")) object.backend = message.backend;
    if (message.modelConfig != null && message.hasOwnProperty("modelConfig")) object.modelConfig = message.modelConfig;

    if (message.modelWeights && message.modelWeights.length) {
      object.modelWeights = [];

      for (let j = 0; j < message.modelWeights.length; ++j) object.modelWeights[j] = $root.Weights.toObject(message.modelWeights[j], options);
    }

    return object;
  };

  Model.prototype.toJSON = function toJSON() {
    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
  };

  return Model;
})();

exports.Model = Model;