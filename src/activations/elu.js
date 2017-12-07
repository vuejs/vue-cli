import cwise from 'cwise'

const _elu = cwise({
  args: ['array', 'scalar'],
  body: function(_x, alpha) {
    _x = Math.max(_x, 0) + alpha * (Math.exp(Math.min(_x, 0)) - 1)
  }
})

/**
 * In-place operation: ELU activation function
 *
 * @param {Tensor} x
 * @param {{alpha: number}} [opts]
 */
export default function elu(x, opts = {}) {
  const { alpha = 1.0 } = opts
  _elu(x.tensor, alpha)
}
