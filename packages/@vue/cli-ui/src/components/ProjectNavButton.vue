<template>
  <div class="project-nav-button">
    <v-popover
      trigger="hover"
      handle-resize
      popover-class="force-tooltip"
      placement="right"
      offset="4"
      :delay="{ show: 300, hide: 0 }"
    >
      <VueGroupButton
        class="flat big"
        :class="{
          'icon-button': !$responsive.wide
        }"
        :value="view.name"
        :icon-left="!imageIcon && view.icon"
      >
        <img
          v-if="imageIcon"
          :src="view.icon"
          class="image-icon"
        >

        <span v-if="$responsive.wide" class="label">{{ $t(view.tooltip) }}</span>
      </VueGroupButton>

      <template slot="popover">
        <div class="title">{{ $t(view.tooltip) }}</div>

        <div v-if="badges" class="badges">
          <ViewBadge
            v-for="badge of badges"
            :key="badge.id"
            :badge="badge"
          />
        </div>
      </template>
    </v-popover>

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
    },

    firstNotHiddenBadge () {
      return this.badges && this.badges.find(b => !b.hidden)
    },

    imageIcon () {
      return this.view.icon && this.view.icon.indexOf('.') !== -1
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

$bg = darken($vue-ui-color-dark, 70%)

.project-nav-button
  position relative

  .bullet
    position absolute
    width 6px
    height @width
    border-radius 50%
    bottom 12px
    left 27px
    pointer-events none
    border solid 2px $vue-ui-color-dark
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

  .wide &
    .bullet
      left 28px

  &:hover
    .bullet
      border-color lighten($bg, 25%)
  &:active
    .bullet
      border-color darken($bg, 8%)

  .image-icon
    max-width 24px
    max-height @width

.badges
  margin ($padding-item/2) 0
  display grid
  grid-template-columns auto
  grid-gap 4px
</style>
