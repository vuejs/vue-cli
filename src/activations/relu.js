import ops from 'ndarray-ops'
import Tensor from '../Tensor'

/**
 * In-place operation: ReLU activation function
 *
 * @param {Tensor} x
 * @param {{alpha: number, maxValue: number}} [opts]
 */
export default function relu(x, opts = {}) {
  const { alpha = 0, maxValue = null } = opts
  let neg
  if (alpha !== 0) {
    neg = new Tensor([], x.tensor.shape)
    ops.mins(neg.tensor, x.tensor, 0)
    ops.mulseq(neg.tensor, alpha)
  }
  ops.maxseq(x.tensor, 0)
  if (maxValue) {
    ops.minseq(x.tensor, maxValue)
  }
  if (neg) {
    ops.addeq(x.tensor, neg.tensor)
  }
}
