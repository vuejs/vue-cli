<template>
  <div class="folder-explorer-item">
    <VueIcon :icon="folder.isPackage ? 'folder' : 'folder_open'" class="folder-icon big"/>
    <div class="folder-name">
      {{ folder.name }}
      <img
        v-if="folder.isVueProject"
        class="vue-ui-project-icon"
        src="~@/assets/logo.png"
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    folder: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.folder-icon
  margin 0 4px
  >>> svg
    fill $vue-ui-color-primary

.folder-name
  flex 100% 1 1
  margin-left $padding-item
  ellipsis()

.vue-ui-project-icon
  width 14px
  height @width
  vertical-align top
  position relative
  top 5px

.folder-explorer-item
  padding $padding-item
  h-box()
  align-items center
  user-select none
  cursor pointer
  position relative

  &:hover
    background rgba($vue-ui-color-primary, .1)
</style>
