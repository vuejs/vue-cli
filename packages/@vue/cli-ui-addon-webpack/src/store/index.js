import Vuex from 'vuex'

import { buildSortedAssets } from '../util/assets'
import { filterModules, buildSortedModules, buildDepModules, buildModulesTrees } from '../util/modules'

Vue.use(Vuex)

const store = new Vuex.Store({
  state () {
    return {
      sizeField: localStorage.getItem('vue-webpack.sizeField') || 'parsed',
      mode: 'serve',
      serve: {
        stats: null
      },
      build: {
        stats: null
      }
    }
  },

  getters: {
    sizeField: state => state.sizeField,
    mode: state => state.mode,
    stats: state => state[state.mode].stats,
    errors: (state, getters) => (getters.stats && getters.stats.data.errors) || [],
    warnings: (state, getters) => (getters.stats && getters.stats.data.warnings) || [],
    assets: (state, getters) => (getters.stats && getters.stats.data.assets) || [],
    assetsSorted: (state, getters) => buildSortedAssets(getters.assets, getters.sizeField),
    assetsTotalSize: (state, getters) => getters.assetsSorted.filter(a => !a.secondary).reduce((total, asset) => total + asset.size, 0),
    rawModules: (state, getters) => (getters.stats && filterModules(getters.stats.data.modules)) || [],
    modules: (state, getters) => buildSortedModules(getters.rawModules, getters.sizeField),
    modulesTotalSize: (state, getters) => getters.modules.reduce((total, module) => total + module.size, 0),
    modulesTrees: (state, getters) => buildModulesTrees(getters.rawModules),
    depModules: (state, getters) => buildDepModules(getters.modules),
    depModulesTotalSize: (state, getters) => getters.depModules.reduce((total, module) => total + module.size, 0),
    chunks: (state, getters) => (getters.stats && getters.stats.data.chunks) || []
  },

  mutations: {
    sizeField (state, value) {
      state.sizeField = value
      localStorage.setItem('vue-webpack.sizeField', value)
    },

    mode (state, value) {
      state.mode = value
    },

    stats (state, { mode, value }) {
      state[mode].stats = value
    }
  }
})

export default store
