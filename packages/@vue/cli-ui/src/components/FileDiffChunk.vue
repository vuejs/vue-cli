<template>
  <div class="file-diff-chunk">
    <div class="changes">
      <FileDiffChange
        v-for="(change, index) of chunk.changes"
        :key="index"
        :change="change"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    chunk: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.file-diff-chunk
  .changes
    overflow-x auto
    display grid
    grid-template-column 1fr

  &:not(:last-child)
    &::after
      content '•••'
      height 44px
      background lighten($vue-ui-color-light-neutral, 30%)
      h-box()
      box-center()
      color darken($vue-ui-color-light-neutral, 30%)
      letter-spacing 4px

</style>
