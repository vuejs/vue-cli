<template>
  <div
    class="loading-screen"
    :class="{
      loading
    }"
  >
    <VueLoadingIndicator
      class="primary big overlay fixed"
    >
      <div class="content">
        <slot/>
      </div>
    </VueLoadingIndicator>
  </div>
</template>

<script>
import { DisableScroll } from '@vue/ui'

export default {
  mixins: [
    DisableScroll
  ],

  props: {
    loading: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.loading-screen
  position absolute
  .content
    display grid
    grid-template-columns 1fr
    grid-gap $padding-item

    >>> .error
      color $vue-color-danger
      v-box()
      box-center()
      > .vue-icon
        margin-bottom $padding-item
        svg
          fill @color
      .actions
        margin-top $padding-item

  &:not(.loading)
    .vue-loading-indicator
      >>> .animation
        display none

  &.loading
    .content
      margin-top $padding-item
</style>
