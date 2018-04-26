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
    sizeField: {
      get () { return this.$store.getters.sizeField },
      set (value) { this.$store.commit('sizeField', value) }
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

    this.sizeHelp = `<b>Stats:</b> size from webpack stats data.<br>
    <b>Parsed:</b> size from extracted source (after minification plugins). More accurate.<br>
    <b>Gzip:</b> size of gzipped extracted source.`
  }
}
