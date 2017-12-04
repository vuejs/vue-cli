import '@babel/polyfill'
import Model from './Model'
import Tensor from './Tensor'
import { webgl2 } from './WebGL2'
import * as activations from './activations'
import * as layers from './layers'
import * as testUtils from './utils/testUtils'

const GPU_SUPPORT = webgl2.isSupported

export { Model, Tensor, GPU_SUPPORT, activations, layers, testUtils }
