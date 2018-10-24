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
        v-else-if="displayImage"
        class="image"
        :src="imageUrl"
        :key="imageUrl"
        @load="loaded = true"
        @error="error = true"
      >
      <VueIcon
        v-else
        :icon="error || !image ? fallbackIcon : image"
      />
    </div>

    <div
      v-if="displayImage && colorBullet"
      class="color-bullet"
    />
  </div>
</template>

<script>
import { getImageUrl } from '@/util/image'

export default {
  props: {
    image: {
      type: String,
      default: 'widgets'
    },

    fallbackIcon: {
      type: String,
      default: 'image'
    },

    selected: {
      type: Boolean,
      default: false
    },

    colorBullet: {
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
    isMaterialIcon () {
      return /^[a-z0-9_]+$/.test(this.image)
    },

    displayImage () {
      return !this.isMaterialIcon && !this.error
    },

    imageUrl () {
      return getImageUrl(this.image)
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
.item-logo
  margin-right $padding-item
  position relative
  width 42px
  height @width
  .wrapper
    h-box()
    box-center()
    width 100%
    height @width
    background rgba(black, .03)
    border-radius 50%
    overflow hidden
    .vue-ui-dark-mode &
      background rgba(white, .07)
    .image
      width 100%
      height @width
      transform scale(0)
      border-radius 50%
    .vue-ui-icon
      width 24px
      height @width
      >>> svg
        fill $color-text-light

  .color-bullet
    position absolute
    width 8px
    height @width
    border-radius 50%
    right -1px
    bottom @right
    background white
    border solid 2px $vue-ui-color-light-neutral
    visibility hidden
    .vue-ui-dark-mode &
      border-color $vue-ui-color-dark

  &.vuejs
    .wrapper
      background lighten($vue-ui-color-primary, 70%)
    .image
      width 70%
      height @width
      position relative
      top 3px
      border-radius 0

  &.identicon
    filter brightness(90%) contrast(115%)
    .vue-ui-dark-mode &
      filter invert(100%) brightness(180%) contrast(70%)
    .wrapper
      background white
    .image
      width 60%
      height @width
      border-radius 0

  &.loaded
    .image
      animation zoom .5s $ease
      transform none

  &.selected,
  &.error
    .wrapper
      animation zoom .5s $ease

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
    .color-bullet
      visibility visible
      background $vue-ui-color-danger
  &.warning
    .vue-ui-icon
      >>> svg
        fill $vue-ui-color-warning
    .color-bullet
      visibility visible
      background $vue-ui-color-warning
  &.info
    .vue-ui-icon
      >>> svg
        fill $vue-ui-color-info
    .color-bullet
      visibility visible
      background $vue-ui-color-info
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
