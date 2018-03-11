<template>
  <div class="content-view">
    <div class="header">
      <h2 v-if="title" class="title">{{ title }}</h2>
      <slot name="header"/>
    </div>

    <div class="content">
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: false
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

  .header
    grid-area header
    h-box()
    box-center()
    background $vue-color-light-neutral
    padding $padding-item

    .title
      flex 100% 1 1
      width 0
      margin 0

    >>> > *
      space-between-x($padding-item)

  .content
    grid-area content
    position relative
</style>
