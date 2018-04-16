import Vuex from 'vuex'

import { buildSortedAssets } from '../util/assets'
import { buildDepModules } from '../util/modules'

Vue.use(Vuex)

const store = new Vuex.Store({
  state () {
    return {
      useGzip: true,
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
    useGzip: state => state.useGzip,
    mode: state => state.mode,
    stats: state => state[state.mode].stats,
    errors: (state, getters) => (getters.stats && getters.stats.data.errors) || [],
    warnings: (state, getters) => (getters.stats && getters.stats.data.warnings) || [],
    assets: (state, getters) => (getters.stats && getters.stats.data.assets) || [],
    assetsSorted: (state, getters) => buildSortedAssets(getters.assets, getters.useGzip),
    assetsTotalSize: (state, getters) => getters.assetsSorted.filter(a => !a.secondary).reduce((total, asset) => total + asset.size, 0),
    modules: (state, getters) => (getters.stats && getters.stats.data.modules) || [],
    modulesTotalSize: (state, getters) => getters.modules.reduce((total, module) => total + module.size, 0),
    depModules: (state, getters) => buildDepModules(getters.modules),
    depModulesTotalSize: (state, getters) => getters.depModules.reduce((total, module) => total + module.size, 0),
    chunks: (state, getters) => (getters.stats && getters.stats.data.chunks) || []
  },

  mutations: {
    useGzip (state, value) {
      state.useGzip = value
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
