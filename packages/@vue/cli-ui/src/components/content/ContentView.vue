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
    .vue-ui-dark-mode &
      background lighten($vue-ui-color-darker, 1%)
    .wrapper
      background $md-white
      position relative
      overflow-x hidden
      overflow-y auto
      .vue-ui-dark-mode &
        background $vue-ui-color-darker

  &.limit-width
    .wrapper
      max-width 1200px
</style>
