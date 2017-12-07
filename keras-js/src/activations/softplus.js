import cwise from 'cwise'

const _softplus = cwise({
  args: ['array'],
  body: function(_x) {
    _x = Math.log(Math.exp(_x) + 1)
  }
})

/**
 * In-place operation: softplus activation function
 *
 * @param {Tensor} x
 */
export default function softplus(x) {
  _softplus(x.tensor)
}
