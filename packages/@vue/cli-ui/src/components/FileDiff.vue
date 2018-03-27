<template>
  <div
    :class="{
      new: fileDiff.new,
      deleted: fileDiff.deleted
    }"
    class="file-diff"
  >
    <div class="toolbar" @click="$emit('update:collapsed', !collapsed)">
      <VueIcon class="file-icon" :icon="icon"/>
      <template v-if="fileDiff.from !== fileDiff.to && !fileDiff.new">
        <div class="name from-file">
          <span v-tooltip="fileDiff.from">{{ fileDiff.from }}</span>
        </div>
        <VueIcon v-if="!fileDiff.deleted" icon="arrow_forward"/>
      </template>
      <div v-if="!fileDiff.deleted" class="name to-file">
        <span v-tooltip="fileDiff.to">{{ fileDiff.to }}</span>
      </div>

      <div class="vue-ui-spacer"/>

      <VueButton
        :icon-left="collapsed ? 'keyboard_arrow_down' : 'keyboard_arrow_up'"
        class="icon-button"
      />
    </div>

    <div v-if="!collapsed" class="content">
      <FileDiffChunk
        v-for="(chunk, index) in fileDiff.chunks"
        :key="index"
        :chunk="chunk"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fileDiff: {
      type: Object,
      required: true
    },

    collapsed: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    icon () {
      if (this.fileDiff.new) {
        return 'note_add'
      } else if (this.fileDiff.deleted) {
        return 'delete'
      }
      return 'insert_drive_file'
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

status-color($color)
  .name
    color $color
  .file-icon
    >>> svg
      fill $color

.file-diff
  background $vue-ui-color-light
  border solid 1px $vue-ui-color-light-neutral
  margin $padding-item

  .toolbar
    padding $padding-item
    background $color-background-light
    h-box()
    align-items center

    >>> > *
      space-between-x($padding-item)

    .file-icon
      >>> svg
        fill darken($vue-ui-color-light-neutral, 20%)

    .name
      flex auto 1 0
      font-family $font-mono
      font-size 12px
      ellipsis()
      &.from-file
        text-decoration line-through
      &.to-file
        flex 100% 1 1
        width 0

    .content
      overflow-x auto

  &.new
    status-color($vue-ui-color-success)
  &.deleted
    status-color($vue-ui-color-danger)
</style>
