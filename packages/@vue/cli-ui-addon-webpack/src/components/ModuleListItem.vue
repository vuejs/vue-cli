<template functional>
  <div class="module-list-item">
    <div class="content">
      <div class="info name">{{ props.module.name }}</div>
      <div class="info size">{{ props.module.size | size('B') }}</div>
      <div class="info">
        <VueLoadingBar :value="props.module.ratio" class="primary"/>
      </div>
    </div>
  </div>
</template>

<script>
import { size } from '../filters'

export default {
  filters: {
    size
  },

  props: {
    module: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.module-list-item
  .content
    display grid
    grid-template-columns 3fr 1fr 1fr
    grid-gap $padding-item
    font-family $font-mono
    font-size 12px

  .info
    display flex
    align-items center

  .size
    color $vue-ui-color-primary
    justify-content flex-end

  .vue-ui-loading-bar
    width 100%
</style>
