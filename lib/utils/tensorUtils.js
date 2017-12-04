"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkShape = checkShape;
exports.data3DLayoutForGL = data3DLayoutForGL;
exports.createIndicesFor2DReshaped = createIndicesFor2DReshaped;

var _range2 = _interopRequireDefault(require("lodash/range"));

var _ndarray = _interopRequireDefault(require("ndarray"));

var _ndarrayOps = _interopRequireDefault(require("ndarray-ops"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkShape(data, shape) {
  if (data.length && shape.length && data.length !== shape.reduce((a, b) => a * b, 1)) {
    throw new Error('[Tensor] specified shape incompatible with data.');
  }
}

function data3DLayoutForGL(typedarrayConstructor, arr, shape) {
  const data = new typedarrayConstructor(arr.data.length);
  const slice = (0, _ndarray.default)(new typedarrayConstructor(shape[0] * shape[1]), [shape[0], shape[1]]);
  let offset = 0;

  for (let i = 0; i < shape[2]; i++) {
    _ndarrayOps.default.assign(slice, arr.pick(null, null, i));

    data.set(slice.data, offset);
    offset += shape[0] * shape[1];
  }

  return data;
}

function createIndicesFor2DReshaped(shape, square = false, axis = -1) {
  const size = shape.reduce((a, b) => a * b, 1);
  const indicesArr = (0, _ndarray.default)(new Int32Array(size), shape);

  if (square) {
    const squareDim = Math.ceil(Math.sqrt(size));
    const indicesRowArrReshaped = (0, _ndarray.default)(new Int32Array(squareDim ** 2), [squareDim, squareDim]);
    const indicesColArrReshaped = (0, _ndarray.default)(new Int32Array(squareDim ** 2), [squareDim, squareDim]);
    const indicesArrReshaped = (0, _ndarray.default)(new Int32Array(squareDim ** 2), [squareDim, squareDim]);

    for (let i = 0; i < squareDim; i++) {
      _ndarrayOps.default.assigns(indicesRowArrReshaped.pick(i, null), i);
    }

    for (let j = 0; j < squareDim; j++) {
      _ndarrayOps.default.assigns(indicesColArrReshaped.pick(null, j), j);
    }

    _ndarrayOps.default.muls(indicesArrReshaped, indicesRowArrReshaped, squareDim);

    _ndarrayOps.default.addeq(indicesArrReshaped, indicesColArrReshaped);

    indicesArr.data.set(indicesArrReshaped.data.subarray(0, indicesArr.size));
  } else {
    if (axis < 0) {
      axis = shape.length + axis;
    }

    const axisSize = shape[axis];
    const indicesRowArr = (0, _ndarray.default)(new Int32Array(size), shape);
    const indicesColArr = (0, _ndarray.default)(new Int32Array(size), shape);
    const otherAxes = [...shape.slice(0, axis), ...shape.slice(axis + 1)];
    const otherAxesSize = otherAxes.reduce((a, b) => a * b, 1);
    const indicesRowArrSlice = (0, _ndarray.default)(new Int32Array((0, _range2.default)(otherAxesSize)), otherAxes);
    const axisSlices = Array(shape.length).fill(null);

    for (let n = 0; n < axisSize; n++) {
      axisSlices[axis] = n;

      _ndarrayOps.default.assign(indicesRowArr.pick(...axisSlices), indicesRowArrSlice);

      _ndarrayOps.default.assigns(indicesColArr.pick(...axisSlices), n);
    }

    _ndarrayOps.default.muls(indicesArr, indicesRowArr, axisSize);

    _ndarrayOps.default.addeq(indicesArr, indicesColArr);
  }

  return indicesArr;
}