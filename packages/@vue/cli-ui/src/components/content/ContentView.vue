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

  .content,
  .wrapper
    width 100%
    height 100%
    box-sizing border-box

  .content
    background $content-bg-secondary-light
    .vue-ui-dark-mode &
      background $content-bg-secondary-dark
    .wrapper
      background $content-bg-primary-light
      position relative
      overflow-x hidden
      overflow-y auto
      .vue-ui-dark-mode &
        background $content-bg-primary-dark

  &.list
    .wrapper
      background $content-bg-list-light
      .vue-ui-dark-mode &
        background $content-bg-list-dark

  &.limit-width
    .wrapper
      max-width 1200px
      margin auto
      @media (min-width 1200px)
        border-radius $br $br 0 0
</style>
