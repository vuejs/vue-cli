<template>
  <div class="project-nav-button">
    <v-tooltip
      trigger="hover"
      handle-resize
      class="force-tooltip"
      placement="right"
      :offset="[0, 4]"
      :delay="{ show: 300, hide: 0 }"
    >
      <VueGroupButton
        class="flat big"
        :class="{
          'icon-button': !$responsive.wide,
          'has-image-icon': imageIcon,
          'default-plugin-icon': defaultPluginIcon
        }"
        :value="view.name"
        :icon-left="!imageIcon ? view.icon : null"
      >
        <img
          v-if="imageIcon"
          :src="icon"
          class="image-icon"
        >

        <span v-if="$responsive.wide" class="label">{{ $t(view.tooltip) }}</span>
      </VueGroupButton>

      <template slot="popper">
        <div class="title">{{ $t(view.tooltip) }}</div>

        <div v-if="badges.length" class="badges">
          <ViewBadge
            v-for="badge of badges"
            :key="badge.id"
            :badge="badge"
          />
        </div>
      </template>
    </v-tooltip>

    <div
      v-if="firstNotHiddenBadge"
      class="bullet"
      :class="[
        `type-${firstNotHiddenBadge.type}`
      ]"
    />
  </div>
</template>

<script>
import { getImageUrl } from '@/util/image'

export default {
  props: {
    view: {
      type: Object,
      required: true
    }
  },

  computed: {
    badges () {
      if (this.view.badges && this.view.badges.length) {
        return this.view.badges.slice().sort((a, b) => b.priority - a.priority)
      }

      return []
    },

    firstNotHiddenBadge () {
      return this.badges && this.badges.find(b => !b.hidden)
    },

    imageIcon () {
      return this.view.icon && this.view.icon.includes('/')
    },

    icon () {
      return getImageUrl(this.view.icon)
    },

    defaultPluginIcon () {
      return this.imageIcon && this.view.icon.includes('/_plugin-logo/')
    }
  }
}
</script>

<style lang="stylus" scoped>
$bg = $vue-ui-color-light-neutral
$bg-dark = $vue-ui-color-dark

.project-nav-button
  position relative

  .force-tooltip
    width 100%

  .bullet
    position absolute
    width 6px
    height @width
    border-radius 50%
    bottom 12px
    left 27px
    pointer-events none
    border solid 2px $bg
    transition border-color .1s
    &.type-info
      background $vue-ui-color-info
    &.type-success
      background $vue-ui-color-success
    &.type-error
      background $vue-ui-color-danger
    &.type-warning
      background $vue-ui-color-warning
    &.type-accent
      background $vue-ui-color-accent
    &.type-dim
      background $md-grey
    .vue-ui-dark-mode &
      border-color $bg-dark

  .wide &
    .bullet
      left 28px

  &:hover
    .bullet
      border-color lighten($bg, 25%)
      .vue-ui-dark-mode &
        border-color lighten($bg-dark, 25%)
  &:active
    .bullet
      border-color darken($bg, 8%)
      .vue-ui-dark-mode &
        border-color darken($bg-dark, 8%)

  .image-icon
    max-width 24px
    max-height @width
    .wide &
      margin-right 6px
      position relative
      left -2px

  .vue-ui-group-button
    &.has-image-icon
      >>> .default-slot
        display flex
        align-items center
        overflow visible !important
        .label
          display block
          max-width 150px
          ellipsis()

    &.default-plugin-icon
      .image-icon
        border-radius 50%

    &.selected
      background rgba($vue-ui-color-primary, .05) !important

.badges
  margin ($padding-item/2) 0
  display grid
  grid-template-columns auto
  grid-gap 4px
</style>
