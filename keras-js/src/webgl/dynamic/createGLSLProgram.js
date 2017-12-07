import add from './merge/add'
import average from './merge/average'
import concatenate from './merge/concatenate'
import maximum from './merge/maximum'
import minimum from './merge/minimum'
import multiply from './merge/multiply'
import subtract from './merge/subtract'
import conv2d from './convolutional/conv2d'
import conv2dTranspose from './convolutional/conv2dTranspose'
import cam from './visualizations/cam'

export default function createGLSLProgram(program, ...args) {
  switch (program) {
    // merge
    case 'add':
      return add(...args)
    case 'average':
      return average(...args)
    case 'concatenate':
      return concatenate(...args)
    case 'maximum':
      return maximum(...args)
    case 'minimum':
      return minimum(...args)
    case 'multiply':
      return multiply(...args)
    case 'subtract':
      return subtract(...args)

    // convolutional
    case 'conv2d':
      return conv2d(...args)
    case 'conv2dTranspose':
      return conv2dTranspose(...args)

    // visualizations
    case 'cam':
      return cam(...args)

    default:
      throw new Error('GLSL program not found')
  }
}
