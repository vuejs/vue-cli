import ndarray from 'ndarray'
import ops from 'ndarray-ops'
import _ from 'lodash'

/**
 * Function to throw error if specified shape is incompatible with data
 *
 * @param {number[]} data
 * @param {number[]} shape
 */

export function checkShape(data, shape) {
  if (data.length && shape.length && data.length !== shape.reduce((a, b) => a * b, 1)) {
    throw new Error('[Tensor] specified shape incompatible with data.')
  }
}

/**
 * Shuffle ndarray data layout for WebGL
 * - data for TEXTURE_2D_ARRAY or TEXTURE_3D laid out sequentially per-slice
 *
 * @param {TypedArray} typedarrayConstructor
 * @param {Object} arr - ndarray tensor
 * @param {number[]} shape
 */
export function data3DLayoutForGL(typedarrayConstructor, arr, shape) {
  const data = new typedarrayConstructor(arr.data.length)
  const slice = ndarray(new typedarrayConstructor(shape[0] * shape[1]), [shape[0], shape[1]])
  let offset = 0
  for (let i = 0; i < shape[2]; i++) {
    ops.assign(slice, arr.pick(null, null, i))
    data.set(slice.data, offset)
    offset += shape[0] * shape[1]
  }

  return data
}

/**
 * Create indicesForReshaped for 2D reshaped tensor
 *
 * @param {number[]} shape
 * @param {boolean} square
 * @param {number} axis
 */
export function createIndicesFor2DReshaped(shape, square = false, axis = -1) {
  const size = shape.reduce((a, b) => a * b, 1)
  const indicesArr = ndarray(new Int32Array(size), shape)

  if (square) {
    // called by Tensor.reshapeTo2DSquare
    const squareDim = Math.ceil(Math.sqrt(size))
    const indicesRowArrReshaped = ndarray(new Int32Array(squareDim ** 2), [squareDim, squareDim])
    const indicesColArrReshaped = ndarray(new Int32Array(squareDim ** 2), [squareDim, squareDim])
    const indicesArrReshaped = ndarray(new Int32Array(squareDim ** 2), [squareDim, squareDim])
    for (let i = 0; i < squareDim; i++) {
      ops.assigns(indicesRowArrReshaped.pick(i, null), i)
    }
    for (let j = 0; j < squareDim; j++) {
      ops.assigns(indicesColArrReshaped.pick(null, j), j)
    }
    // i * cols + j
    ops.muls(indicesArrReshaped, indicesRowArrReshaped, squareDim)
    ops.addeq(indicesArrReshaped, indicesColArrReshaped)
    indicesArr.data.set(indicesArrReshaped.data.subarray(0, indicesArr.size))
  } else {
    // called by Tensor.reshapeTo2D
    if (axis < 0) {
      axis = shape.length + axis
    }
    const axisSize = shape[axis]
    const indicesRowArr = ndarray(new Int32Array(size), shape)
    const indicesColArr = ndarray(new Int32Array(size), shape)
    const otherAxes = [...shape.slice(0, axis), ...shape.slice(axis + 1)]
    const otherAxesSize = otherAxes.reduce((a, b) => a * b, 1)
    const indicesRowArrSlice = ndarray(new Int32Array(_.range(otherAxesSize)), otherAxes)
    const axisSlices = Array(shape.length).fill(null)
    for (let n = 0; n < axisSize; n++) {
      axisSlices[axis] = n
      ops.assign(indicesRowArr.pick(...axisSlices), indicesRowArrSlice)
      ops.assigns(indicesColArr.pick(...axisSlices), n)
    }
    // i * cols + j
    ops.muls(indicesArr, indicesRowArr, axisSize)
    ops.addeq(indicesArr, indicesColArr)
  }

  return indicesArr
}
