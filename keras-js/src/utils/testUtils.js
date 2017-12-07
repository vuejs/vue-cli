import unpack from 'ndarray-unpack'
import _ from 'lodash'

/**
 * Compares an ndarray's data element-wise to dataExpected,
 * within a certain tolerance. We unpack the ndarray first since
 * stride/offset prevents us from comparing the array data
 * element-wise directly.
 *
 * @param {Object} ndarrayOut
 * @param {number[]} dataExpected
 * @param {number} tol
 */
export function approxEquals(ndarrayOut, dataExpected, tol = 0.0001) {
  const a = _.flattenDeep(unpack(ndarrayOut))
  const b = dataExpected
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (!_.isFinite(a[i])) {
      return false
    }
    if (a[i] < b[i] - tol || a[i] > b[i] + tol) {
      return false
    }
  }
  return true
}
