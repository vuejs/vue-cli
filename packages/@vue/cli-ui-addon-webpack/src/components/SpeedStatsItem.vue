<template>
  <div
    class="speed-stats-item"
    v-tooltip="{
      content: tooltip,
      offset: 16
    }"
  >
    <div class="content">
      <div class="label">{{ stats.title }}</div>
      <div class="value">{{ stats.totalDownloadTime | round(100) }}s</div>
    </div>
  </div>
</template>

<script>
import { round } from '../filters'

export default {
  filters: {
    round
  },

  props: {
    stats: {
      type: Object,
      required: true
    }
  },

  computed: {
    tooltip () {
      return `${this.stats.mbps}Mbps + ${this.stats.rtt}ms RTT`
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.content
  font-family $font-mono
  font-size 12px
  display grid
  grid-template-columns 3fr 2fr
  grid-gap $padding-item

  .label
    text-align right

  .value
    color $vue-ui-color-primary
</style>
