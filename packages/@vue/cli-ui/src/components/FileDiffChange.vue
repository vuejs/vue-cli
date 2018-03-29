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
      <div
        :class="{
          disabled: !ln2
        }"
        class="ln ln2"
        @click="openInEditor()"
      >
        {{ ln2 }}
      </div>
    </div>
    <div class="content">{{ change.content }}</div>
  </div>
</template>

<script>
import FILE_OPEN_IN_EDITOR from '../graphql/fileOpenInEditor.gql'

export default {
  inject: [
    'FileDiffInjection'
  ],

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
  },

  methods: {
    openInEditor () {
      if (!this.ln2) return

      this.$apollo.mutate({
        mutation: FILE_OPEN_IN_EDITOR,
        variables: {
          input: {
            file: this.FileDiffInjection.data.to,
            line: this.ln2,
            gitPath: true
          }
        }
      })
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

    .ln2
      cursor pointer
      &:hover
        text-decoration underline
      &.disabled
        pointer-events none

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
