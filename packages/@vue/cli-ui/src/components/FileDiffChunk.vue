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
.file-diff-chunk
  .changes
    overflow-x auto
    display grid
    grid-template-column 1fr

  &:not(:last-child)
    &::after
      content '•••'
      height 44px
      background $md-grey-100
      h-box()
      box-center()
      color $md-grey-300
      letter-spacing 4px
      .vue-ui-dark-mode &
        background lighten($vue-ui-color-darker, 1%)
        color $vue-ui-color-dark-neutral

</style>
