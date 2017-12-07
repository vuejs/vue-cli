/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const Weights = $root.Weights = (() => {

    /**
     * Properties of a Weights.
     * @exports IWeights
     * @interface IWeights
     * @property {string} [layerName] Weights layerName
     * @property {string} [weightName] Weights weightName
     * @property {Array.<number>} [shape] Weights shape
     * @property {string} [type] Weights type
     * @property {Uint8Array} [data] Weights data
     * @property {number} [quantizeMin] Weights quantizeMin
     * @property {number} [quantizeMax] Weights quantizeMax
     */

    /**
     * Constructs a new Weights.
     * @exports Weights
     * @classdesc Represents a Weights.
     * @constructor
     * @param {IWeights=} [properties] Properties to set
     */
    function Weights(properties) {
        this.shape = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Weights layerName.
     * @member {string}layerName
     * @memberof Weights
     * @instance
     */
    Weights.prototype.layerName = "";

    /**
     * Weights weightName.
     * @member {string}weightName
     * @memberof Weights
     * @instance
     */
    Weights.prototype.weightName = "";

    /**
     * Weights shape.
     * @member {Array.<number>}shape
     * @memberof Weights
     * @instance
     */
    Weights.prototype.shape = $util.emptyArray;

    /**
     * Weights type.
     * @member {string}type
     * @memberof Weights
     * @instance
     */
    Weights.prototype.type = "";

    /**
     * Weights data.
     * @member {Uint8Array}data
     * @memberof Weights
     * @instance
     */
    Weights.prototype.data = $util.newBuffer([]);

    /**
     * Weights quantizeMin.
     * @member {number}quantizeMin
     * @memberof Weights
     * @instance
     */
    Weights.prototype.quantizeMin = 0;

    /**
     * Weights quantizeMax.
     * @member {number}quantizeMax
     * @memberof Weights
     * @instance
     */
    Weights.prototype.quantizeMax = 0;

    /**
     * Creates a new Weights instance using the specified properties.
     * @function create
     * @memberof Weights
     * @static
     * @param {IWeights=} [properties] Properties to set
     * @returns {Weights} Weights instance
     */
    Weights.create = function create(properties) {
        return new Weights(properties);
    };

    /**
     * Encodes the specified Weights message. Does not implicitly {@link Weights.verify|verify} messages.
     * @function encode
     * @memberof Weights
     * @static
     * @param {IWeights} message Weights message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Weights.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.layerName != null && message.hasOwnProperty("layerName"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.layerName);
        if (message.weightName != null && message.hasOwnProperty("weightName"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.weightName);
        if (message.shape != null && message.shape.length) {
            writer.uint32(/* id 3, wireType 2 =*/26).fork();
            for (let i = 0; i < message.shape.length; ++i)
                writer.uint32(message.shape[i]);
            writer.ldelim();
        }
        if (message.type != null && message.hasOwnProperty("type"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.type);
        if (message.data != null && message.hasOwnProperty("data"))
            writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.data);
        if (message.quantizeMin != null && message.hasOwnProperty("quantizeMin"))
            writer.uint32(/* id 6, wireType 5 =*/53).float(message.quantizeMin);
        if (message.quantizeMax != null && message.hasOwnProperty("quantizeMax"))
            writer.uint32(/* id 7, wireType 5 =*/61).float(message.quantizeMax);
        return writer;
    };

    /**
     * Encodes the specified Weights message, length delimited. Does not implicitly {@link Weights.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Weights
     * @static
     * @param {IWeights} message Weights message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Weights.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Weights message from the specified reader or buffer.
     * @function decode
     * @memberof Weights
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Weights} Weights
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Weights.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Weights();
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
                if (!(message.shape && message.shape.length))
                    message.shape = [];
                if ((tag & 7) === 2) {
                    let end2 = reader.uint32() + reader.pos;
                    while (reader.pos < end2)
                        message.shape.push(reader.uint32());
                } else
                    message.shape.push(reader.uint32());
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

    /**
     * Decodes a Weights message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Weights
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Weights} Weights
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Weights.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Weights message.
     * @function verify
     * @memberof Weights
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Weights.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.layerName != null && message.hasOwnProperty("layerName"))
            if (!$util.isString(message.layerName))
                return "layerName: string expected";
        if (message.weightName != null && message.hasOwnProperty("weightName"))
            if (!$util.isString(message.weightName))
                return "weightName: string expected";
        if (message.shape != null && message.hasOwnProperty("shape")) {
            if (!Array.isArray(message.shape))
                return "shape: array expected";
            for (let i = 0; i < message.shape.length; ++i)
                if (!$util.isInteger(message.shape[i]))
                    return "shape: integer[] expected";
        }
        if (message.type != null && message.hasOwnProperty("type"))
            if (!$util.isString(message.type))
                return "type: string expected";
        if (message.data != null && message.hasOwnProperty("data"))
            if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                return "data: buffer expected";
        if (message.quantizeMin != null && message.hasOwnProperty("quantizeMin"))
            if (typeof message.quantizeMin !== "number")
                return "quantizeMin: number expected";
        if (message.quantizeMax != null && message.hasOwnProperty("quantizeMax"))
            if (typeof message.quantizeMax !== "number")
                return "quantizeMax: number expected";
        return null;
    };

    /**
     * Creates a Weights message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Weights
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Weights} Weights
     */
    Weights.fromObject = function fromObject(object) {
        if (object instanceof $root.Weights)
            return object;
        let message = new $root.Weights();
        if (object.layerName != null)
            message.layerName = String(object.layerName);
        if (object.weightName != null)
            message.weightName = String(object.weightName);
        if (object.shape) {
            if (!Array.isArray(object.shape))
                throw TypeError(".Weights.shape: array expected");
            message.shape = [];
            for (let i = 0; i < object.shape.length; ++i)
                message.shape[i] = object.shape[i] >>> 0;
        }
        if (object.type != null)
            message.type = String(object.type);
        if (object.data != null)
            if (typeof object.data === "string")
                $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
            else if (object.data.length)
                message.data = object.data;
        if (object.quantizeMin != null)
            message.quantizeMin = Number(object.quantizeMin);
        if (object.quantizeMax != null)
            message.quantizeMax = Number(object.quantizeMax);
        return message;
    };

    /**
     * Creates a plain object from a Weights message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Weights
     * @static
     * @param {Weights} message Weights
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Weights.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.shape = [];
        if (options.defaults) {
            object.layerName = "";
            object.weightName = "";
            object.type = "";
            object.data = options.bytes === String ? "" : [];
            object.quantizeMin = 0;
            object.quantizeMax = 0;
        }
        if (message.layerName != null && message.hasOwnProperty("layerName"))
            object.layerName = message.layerName;
        if (message.weightName != null && message.hasOwnProperty("weightName"))
            object.weightName = message.weightName;
        if (message.shape && message.shape.length) {
            object.shape = [];
            for (let j = 0; j < message.shape.length; ++j)
                object.shape[j] = message.shape[j];
        }
        if (message.type != null && message.hasOwnProperty("type"))
            object.type = message.type;
        if (message.data != null && message.hasOwnProperty("data"))
            object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
        if (message.quantizeMin != null && message.hasOwnProperty("quantizeMin"))
            object.quantizeMin = options.json && !isFinite(message.quantizeMin) ? String(message.quantizeMin) : message.quantizeMin;
        if (message.quantizeMax != null && message.hasOwnProperty("quantizeMax"))
            object.quantizeMax = options.json && !isFinite(message.quantizeMax) ? String(message.quantizeMax) : message.quantizeMax;
        return object;
    };

    /**
     * Converts this Weights to JSON.
     * @function toJSON
     * @memberof Weights
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Weights.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Weights;
})();

export const Model = $root.Model = (() => {

    /**
     * Properties of a Model.
     * @exports IModel
     * @interface IModel
     * @property {string} [id] Model id
     * @property {string} [name] Model name
     * @property {string} [kerasVersion] Model kerasVersion
     * @property {string} [backend] Model backend
     * @property {string} [modelConfig] Model modelConfig
     * @property {Array.<IWeights>} [modelWeights] Model modelWeights
     */

    /**
     * Constructs a new Model.
     * @exports Model
     * @classdesc Represents a Model.
     * @constructor
     * @param {IModel=} [properties] Properties to set
     */
    function Model(properties) {
        this.modelWeights = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Model id.
     * @member {string}id
     * @memberof Model
     * @instance
     */
    Model.prototype.id = "";

    /**
     * Model name.
     * @member {string}name
     * @memberof Model
     * @instance
     */
    Model.prototype.name = "";

    /**
     * Model kerasVersion.
     * @member {string}kerasVersion
     * @memberof Model
     * @instance
     */
    Model.prototype.kerasVersion = "";

    /**
     * Model backend.
     * @member {string}backend
     * @memberof Model
     * @instance
     */
    Model.prototype.backend = "";

    /**
     * Model modelConfig.
     * @member {string}modelConfig
     * @memberof Model
     * @instance
     */
    Model.prototype.modelConfig = "";

    /**
     * Model modelWeights.
     * @member {Array.<IWeights>}modelWeights
     * @memberof Model
     * @instance
     */
    Model.prototype.modelWeights = $util.emptyArray;

    /**
     * Creates a new Model instance using the specified properties.
     * @function create
     * @memberof Model
     * @static
     * @param {IModel=} [properties] Properties to set
     * @returns {Model} Model instance
     */
    Model.create = function create(properties) {
        return new Model(properties);
    };

    /**
     * Encodes the specified Model message. Does not implicitly {@link Model.verify|verify} messages.
     * @function encode
     * @memberof Model
     * @static
     * @param {IModel} message Model message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Model.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && message.hasOwnProperty("id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
        if (message.name != null && message.hasOwnProperty("name"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
        if (message.kerasVersion != null && message.hasOwnProperty("kerasVersion"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.kerasVersion);
        if (message.backend != null && message.hasOwnProperty("backend"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.backend);
        if (message.modelConfig != null && message.hasOwnProperty("modelConfig"))
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.modelConfig);
        if (message.modelWeights != null && message.modelWeights.length)
            for (let i = 0; i < message.modelWeights.length; ++i)
                $root.Weights.encode(message.modelWeights[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified Model message, length delimited. Does not implicitly {@link Model.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Model
     * @static
     * @param {IModel} message Model message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Model.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Model message from the specified reader or buffer.
     * @function decode
     * @memberof Model
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Model} Model
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Model.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Model();
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
                if (!(message.modelWeights && message.modelWeights.length))
                    message.modelWeights = [];
                message.modelWeights.push($root.Weights.decode(reader, reader.uint32()));
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Model message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Model
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Model} Model
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Model.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Model message.
     * @function verify
     * @memberof Model
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Model.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.kerasVersion != null && message.hasOwnProperty("kerasVersion"))
            if (!$util.isString(message.kerasVersion))
                return "kerasVersion: string expected";
        if (message.backend != null && message.hasOwnProperty("backend"))
            if (!$util.isString(message.backend))
                return "backend: string expected";
        if (message.modelConfig != null && message.hasOwnProperty("modelConfig"))
            if (!$util.isString(message.modelConfig))
                return "modelConfig: string expected";
        if (message.modelWeights != null && message.hasOwnProperty("modelWeights")) {
            if (!Array.isArray(message.modelWeights))
                return "modelWeights: array expected";
            for (let i = 0; i < message.modelWeights.length; ++i) {
                let error = $root.Weights.verify(message.modelWeights[i]);
                if (error)
                    return "modelWeights." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Model message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Model
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Model} Model
     */
    Model.fromObject = function fromObject(object) {
        if (object instanceof $root.Model)
            return object;
        let message = new $root.Model();
        if (object.id != null)
            message.id = String(object.id);
        if (object.name != null)
            message.name = String(object.name);
        if (object.kerasVersion != null)
            message.kerasVersion = String(object.kerasVersion);
        if (object.backend != null)
            message.backend = String(object.backend);
        if (object.modelConfig != null)
            message.modelConfig = String(object.modelConfig);
        if (object.modelWeights) {
            if (!Array.isArray(object.modelWeights))
                throw TypeError(".Model.modelWeights: array expected");
            message.modelWeights = [];
            for (let i = 0; i < object.modelWeights.length; ++i) {
                if (typeof object.modelWeights[i] !== "object")
                    throw TypeError(".Model.modelWeights: object expected");
                message.modelWeights[i] = $root.Weights.fromObject(object.modelWeights[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Model message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Model
     * @static
     * @param {Model} message Model
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Model.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.modelWeights = [];
        if (options.defaults) {
            object.id = "";
            object.name = "";
            object.kerasVersion = "";
            object.backend = "";
            object.modelConfig = "";
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.kerasVersion != null && message.hasOwnProperty("kerasVersion"))
            object.kerasVersion = message.kerasVersion;
        if (message.backend != null && message.hasOwnProperty("backend"))
            object.backend = message.backend;
        if (message.modelConfig != null && message.hasOwnProperty("modelConfig"))
            object.modelConfig = message.modelConfig;
        if (message.modelWeights && message.modelWeights.length) {
            object.modelWeights = [];
            for (let j = 0; j < message.modelWeights.length; ++j)
                object.modelWeights[j] = $root.Weights.toObject(message.modelWeights[j], options);
        }
        return object;
    };

    /**
     * Converts this Model to JSON.
     * @function toJSON
     * @memberof Model
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Model.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Model;
})();

export { $root as default };
