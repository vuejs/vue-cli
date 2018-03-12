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
        v-else-if="image && !error"
        class="image"
        :src="image"
        :key="image"
        @load="loaded = true"
        @error="error = true"
      >
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
    .vue-icon
      width 24px
      height @width
      >>> svg
        fill rgba($color-text-light, .3)

  &.vuejs
    .wrapper
      background lighten($vue-color-primary, 70%)
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
      background $vue-color-primary
      .vue-icon
        >>> svg
          fill $vue-color-light

@keyframes zoom
  0%
    transform scale(0)
  100%
    transform scale(1)
</style>
