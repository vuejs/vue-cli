<template functional>
  <div
    :class="{
      big: props.asset.big,
      secondary: props.asset.secondary
    }"
    class="asset-list-item"
  >
    <div class="content">
      <div class="info name">{{ props.asset.name }}</div>
      <div class="info size">{{ props.asset.size | size('B') }}</div>
      <div class="info speed global">{{ props.asset.speeds.global.totalDownloadTime | round(100) }}s</div>
      <div class="info speed 3gs">{{ props.asset.speeds['3gs'].totalDownloadTime | round(100) }}s</div>
      <div class="info speed 3gf">{{ props.asset.speeds['3gf'].totalDownloadTime | round(100) }}s</div>
      <div class="info warning">
        <VueIcon
          v-if="!props.asset.secondary && props.asset.big"
          icon="warning"
          class="icon"
          v-tooltip="parent.$t('org.vue.vue-webpack.dashboard.asset-list.size-warning')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { size, round } from '../filters'

export default {
  filters: {
    size,
    round
  },

  props: {
    asset: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.asset-list-item
  .content
    display grid
    grid-template-columns 5fr repeat(4, 1fr) 16px
    grid-gap $padding-item
    font-family $font-mono
    font-size 12px

  .info
    display flex
    align-items center

  .name
    word-break break-all

  .size,
  .speed
    color $vue-ui-color-primary
    justify-content flex-end

  .icon
    >>> svg
      fill $vue-ui-color-primary

  &.big
    font-weight bold

  &.secondary
    opacity .5
</style>
