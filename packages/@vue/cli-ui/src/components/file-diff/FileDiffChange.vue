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
    <div class="content" v-html="change.content"/>
  </div>
</template>

<script>
import FILE_OPEN_IN_EDITOR from '@/graphql/file/fileOpenInEditor.gql'

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
    .vue-ui-dark-mode &
      background darken($vue-ui-color-dark, 10%)
      color $vue-ui-color-light

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
    background desaturate(lighten($vue-ui-color-success, 90%), 30%)
    .vue-ui-dark-mode &
      background desaturate(darken($vue-ui-color-success, 60%), 50%)
    .lines
      background lighten($vue-ui-color-success, 80%)
      .vue-ui-dark-mode &
       background darken($vue-ui-color-success, 60%)

  &.type-del
    background desaturate(lighten($vue-ui-color-danger, 90%), 30%)
    .vue-ui-dark-mode &
      background desaturate(darken($vue-ui-color-danger, 60%), 50%)

    .lines
      background lighten($vue-ui-color-danger, 80%)
      .vue-ui-dark-mode &
        background darken($vue-ui-color-danger, 60%)

</style>
