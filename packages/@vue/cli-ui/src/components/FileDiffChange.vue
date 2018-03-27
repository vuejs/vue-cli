<template>
  <div
    :class="[
      `type-${change.type}`
    ]"
    class="file-diff-change"
  >
    <div class="lines">
      <div class="ln ln1">
        {{ ln1 }}
      </div>
      <div class="ln ln2">
        {{ ln2 }}
      </div>
    </div>
    <div class="content">{{ change.content }}</div>
  </div>
</template>

<script>
export default {
  props: {
    change: {
      type: Object,
      required: true
    }
  },

  computed: {
    ln1 () {
      if (this.change.normal) {
        return this.change.ln1
      } else if (this.change.type === 'del') {
        return this.change.ln
      }
    },

    ln2 () {
      if (this.change.normal) {
        return this.change.ln2
      } else if (this.change.type === 'add') {
        return this.change.ln
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.file-diff-change
  font-family $font-mono
  font-size 12px
  h-box()

  .ln,
  .content
    padding 4px $padding-item

  .lines
    width 120px
    h-box()
    background $color-background-light
    color rgba($vue-ui-color-dark, .4)

    .ln
      text-align right
      flex 100% 1 1
      width 0
      overflow hidden

  .content
    flex auto 1 1
    white-space pre

  &.type-add
    background lighten($vue-ui-color-success, 80%)
    .lines
      background lighten($vue-ui-color-success, 60%)

  &.type-del
    background lighten($vue-ui-color-danger, 80%)
    .lines
      background lighten($vue-ui-color-danger, 60%)
</style>
