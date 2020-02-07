import store from '../store'

// @vue/component
export default {
  store,

  inject: [
    'TaskDetails'
  ],

  data () {
    return {
      mode: null
    }
  },

  sharedData () {
    return {
      serveUrl: 'org.vue.webpack.serve-url',
      modernMode: 'org.vue.webpack.modern-mode'
    }
  },

  computed: {
    sizeField: {
      get () { return this.$store.getters.sizeField },
      set (value) { this.$store.commit('sizeField', value) }
    },

    showModernBuild: {
      get () { return this.$store.state.showModernBuild },
      set (value) { this.$store.commit('showModernBuild', value) }
    }
  },

  watch: {
    modernMode: {
      handler (value) {
        this.showModernBuild = value
      },
      immediate: true
    }
  },

  created () {
    const mode = this.mode = this.TaskDetails.task.command.match(/vue-cli-service\s+(\S+)/)[1]
    this.$store.commit('mode', mode)
    if (mode === 'build') {
      this.syncMode('build-modern')
    }
    this.syncMode(mode)
  },

  methods: {
    syncMode (mode) {
      this.$watchSharedData(`org.vue.webpack.${mode}-stats`, value => {
        this.$store.commit('stats', {
          mode,
          value
        })
      })
    }
  }
}
