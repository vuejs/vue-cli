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
.top-bar
  padding $padding-item
  h-box()
  align-items center
  position relative
  height 32px
  z-index 1
  background $content-bg-secondary-light
  .vue-ui-dark-mode &
    background $content-bg-secondary-dark

  &,
  .actions
    /deep/ > *
      space-between-x($padding-item)

.title
  font-size 28px
  font-weight lighter
</style>
