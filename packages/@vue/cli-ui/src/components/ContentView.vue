<template>
  <div class="content-view">
    <portal v-if="title" to="top-title">{{ title }}</portal>
    <portal to="top-actions">
      <slot name="actions"/>
    </portal>

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

  .wrapper
    width 100%
    height 100%
    box-sizing border-box

  .content
    height 100%
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
