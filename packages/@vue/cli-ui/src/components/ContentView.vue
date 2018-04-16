<template>
  <div class="content-view">
    <div class="header">
      <div class="wrapper">
        <h2 v-if="title" class="title">{{ title }}</h2>
        <slot name="header"/>
      </div>
    </div>

    <div class="content">
      <div class="wrapper">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.content-view
  height 100%
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr
  grid-template-areas "header" "content"

  .wrapper
    width 100%
    height 100%
    box-sizing border-box

  .header
    grid-area header
    background darken($vue-ui-color-light-neutral, 3%)
    .wrapper
      background $vue-ui-color-light-neutral
      h-box()
      box-center()
      padding $padding-item

    .title
      flex 100% 1 1
      width 0
      margin 0

    >>> > *
      space-between-x($padding-item)

  .content
    grid-area content
    background $color-background-light
    .wrapper
      background $md-white
      position relative
      overflow-x hidden
      overflow-y auto

  &.limit-width
    .wrapper
      max-width 1200px
</style>
