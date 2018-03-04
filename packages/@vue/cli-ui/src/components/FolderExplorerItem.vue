<template>
  <div class="foder-explorer-item">
    <VueIcon icon="folder" class="folder-icon big"/>
    <div class="folder-name">{{ folder.name }}</div>
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
    fill $vue-color-primary

.folder-name
  flex 100% 1 1
  margin-left 12px
  ellipsis()

.foder-explorer-item
  padding 12px
  h-box()
  align-items center
  user-select none
  cursor pointer

  &:hover
    background rgba($vue-color-primary, .1)
</style>
