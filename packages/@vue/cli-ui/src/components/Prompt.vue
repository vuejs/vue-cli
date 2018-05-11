<script>
import ListItemInfo from './ListItemInfo.vue'

export default {
  components: {
    ListItemInfo
  },

  props: {
    prompt: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      modifiedValue: undefined
    }
  },

  methods: {
    value (value) {
      if (this.$options.buffer && typeof this.modifiedValue !== 'undefined') return this.modifiedValue
      return JSON.parse(value)
    },

    answer (value) {
      this.modifiedValue = value
      this.$emit('answer', value)
    }
  }
}
</script>

<style lang="stylus">
@import "~@/style/imports"

.prompt
  list-item()
  .prompt-content
    display grid
    grid-template-columns auto 300px
    grid-template-rows auto
    grid-template-areas "info input"
    grid-gap $padding-item
    padding $padding-item

    > .list-item-info
      grid-area info

    > .prompt-input
      grid-area input
      v-box()
      align-items stretch
      justify-content center
</style>
