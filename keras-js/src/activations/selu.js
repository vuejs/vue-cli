import cwise from 'cwise'

const _selu = cwise({
  args: ['array', 'scalar'],
  body: function(_x) {
    const alpha = 1.6732632423543772848170429916717
    const scale = 1.0507009873554804934193349852946
    _x = scale * (Math.max(_x, 0) + alpha * (Math.exp(Math.min(_x, 0)) - 1))
  }
})

/**
 * In-place operation: SELU activation function
 *
 * @param {Tensor} x
 */
export default function selu(x) {
  _selu(x.tensor)
}
