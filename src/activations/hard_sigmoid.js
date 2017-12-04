import cwise from 'cwise'

// Reference hard sigmoid with slope and shift values from theano, see
// https://github.com/Theano/Theano/blob/master/theano/tensor/nnet/sigm.py
const _hard_sigmoid = cwise({
  args: ['array'],
  body: function(_x) {
    _x = _x * 0.2 + 0.5
    if (_x <= 0) {
      _x = 0
    } else if (_x >= 1) {
      _x = 1
    }
  }
})

/**
 * In-place operation: hard sigmoid activation function
 *
 * @param {Tensor} x
 */
export default function hard_sigmoid(x) {
  _hard_sigmoid(x.tensor)
}
