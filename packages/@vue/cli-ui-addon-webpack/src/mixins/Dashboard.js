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

  computed: {
    useGzip: {
      get () { return this.$store.getters.useGzip },
      set (value) { this.$store.commit('useGzip', value) }
    }
  },

  created () {
    const mode = this.mode = this.TaskDetails.task.command.indexOf('vue-cli-service serve') !== -1 ? 'serve' : 'build'
    this.$store.commit('mode', mode)
    this.$watchSharedData(`webpack-dashboard-${mode}-stats`, value => {
      this.$store.commit('stats', {
        mode,
        value
      })
    })
  }
}
