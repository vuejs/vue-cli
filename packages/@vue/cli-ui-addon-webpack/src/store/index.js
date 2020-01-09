import Vuex from 'vuex'

import { buildSortedAssets } from '../util/assets'

Vue.use(Vuex)

const store = new Vuex.Store({
  state () {
    return {
      sizeField: localStorage.getItem('org.vue.vue-webpack.sizeField') || 'parsed',
      mode: 'serve',
      showModernBuild: true,
      serve: {
        stats: null,
        analyzer: {}
      },
      build: {
        stats: null,
        analyzer: {}
      },
      'build-modern': {
        stats: null,
        analyzer: {}
      }
    }
  },

  getters: {
    sizeField: state => state.sizeField,
    mode: state => {
      if (state.mode === 'build' && state.showModernBuild) {
        return 'build-modern'
      }
      return state.mode
    },
    stats: (state, getters) => state[getters.mode].stats,
    errors: (state, getters) => (getters.stats && getters.stats.data.errors) || [],
    warnings: (state, getters) => (getters.stats && getters.stats.data.warnings) || [],
    assets: (state, getters) => (getters.stats && getters.stats.data.assets) || [],
    assetsSorted: (state, getters) => buildSortedAssets(getters.assets, getters.sizeField),
    assetsTotalSize: (state, getters) => getters.assetsSorted.filter(a => !a.secondary).reduce((total, asset) => total + asset.size, 0),
    modules: (state, getters) => (getters.stats && getters.stats.computed.modulesPerSizeType[getters.sizeField]) || {},
    modulesTotalSize: (state, getters) => getters.modules.modulesTotalSize || 0,
    analyzer: (state, getters) => state[getters.mode].analyzer[getters.sizeField],
    modulesTrees: (state, getters) => (getters.analyzer && getters.analyzer.modulesTrees) || [],
    depModules: (state, getters) => getters.modules.depModules || [],
    depModulesTotalSize: (state, getters) => getters.modules.depModulesTotalSize || 0,
    chunks: (state, getters) => (getters.stats && getters.stats.data.chunks) || []
  },

  mutations: {
    sizeField (state, value) {
      state.sizeField = value
      localStorage.setItem('org.vue.vue-webpack.sizeField', value)
    },

    mode (state, value) {
      state.mode = value
    },

    showModernBuild (state, value) {
      state.showModernBuild = value
    },

    stats (state, { mode, value }) {
      state[mode].stats = Object.freeze(value)
    },

    analyzer (state, { mode, value }) {
      console.log(value)
      state[mode].analyzer = Object.freeze(value)
    }
  }
})

export default store
