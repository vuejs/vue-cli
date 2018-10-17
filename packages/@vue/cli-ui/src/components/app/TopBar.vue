<template>
  <div class="top-bar">
    <portal-target name="top-title" class="title">Vue</portal-target>

    <AppLoading/>

    <div class="vue-ui-spacer"/>

    <SuggestionBar/>

    <portal-target name="top-actions" class="actions"/>
  </div>
</template>

<style lang="stylus" scoped>
@import "~@/style/imports"

.top-bar
  padding $padding-item
  h-box()
  align-items center
  position relative
  height 32px
  z-index 1
  background darken($vue-ui-color-light-neutral, 12%)
  .vue-ui-dark-mode &
    background lighten($vue-ui-color-darker, 6%)

  &,
  .actions
    /deep/ > *
      space-between-x($padding-item)

.title
  font-size 28px
  font-weight lighter
</style>
