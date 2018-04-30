<template>
  <div
    class="item-logo"
    :class="{
      selected,
      loaded,
      error,
      vuejs: image && image.includes('vuejs')
    }"
  >
    <div class="wrapper">
      <VueIcon
        v-if="selected"
        icon="done"
      />
      <img
        v-else-if="imageEnabled && !error"
        class="image"
        :src="imageUrl"
        :key="imageUrl"
        @load="loaded = true"
        @error="error = true"
      >
      <div
        v-else-if="fileIcon"
        class="dynamic-file-icon"
        :class="fileIcon"
      />
      <VueIcon
        v-else
        :icon="icon"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      default: null
    },

    icon: {
      type: String,
      default: 'widgets'
    },

    fileIcon: {
      type: String,
      default: null
    },

    selected: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loaded: false,
      error: false
    }
  },

  computed: {
    imageEnabled () {
      return this.image || (this.icon && this.icon.indexOf('.') !== -1)
    },

    imageUrl () {
      return this.image || this.icon
    }
  },

  watch: {
    image: 'reset',
    selected: 'reset'
  },

  methods: {
    reset () {
      this.loaded = false
      this.error = false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.item-logo
  margin-right $padding-item
  .wrapper
    h-box()
    box-center()
    width 42px
    height @width
    background rgba(black, .03)
    border-radius 50%
    overflow hidden
    .image
      width 100%
      height @width
      transform scale(0)
    .vue-ui-icon
      width 24px
      height @width
      >>> svg
        fill rgba($color-text-light, .3)

  .dynamic-file-icon
    &::before
      font-size 24px

  &.vuejs
    .wrapper
      background lighten($vue-ui-color-primary, 70%)
    .image
      width 70%
      height @width
      position relative
      top 3px

  &.loaded
    .image
      animation zoom .1s
      transform none

  &.selected,
  &.error
    .wrapper
      animation zoom .1s

  &.selected
    .wrapper
      background $vue-ui-color-primary
      .vue-ui-icon
        >>> svg
          fill $vue-ui-color-light

  &.danger
    .vue-ui-icon
      >>> svg
        fill $vue-ui-color-danger
  &.warning
    .vue-ui-icon
      >>> svg
        fill $vue-ui-color-warning
  &.info
    .vue-ui-icon
      >>> svg
        fill $vue-ui-color-info
  &.success
    .vue-ui-icon
      >>> svg
        fill $vue-ui-color-success

@keyframes zoom
  0%
    transform scale(0)
  100%
    transform scale(1)
</style>
