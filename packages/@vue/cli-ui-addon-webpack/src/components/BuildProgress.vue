<template>
  <div class="build-progress">
    <div class="content">
      <loading-progress
        :progress="progress"
        size="128"
        counter-clockwise
      />

      <div class="progress">
        {{ typeof progress === 'number' ? Math.round(progress * 100) : 0 }}
      </div>

      <transition duration="500">
        <div v-if="status === 'Success'" class="status-icon done">
          <div class="wrapper">
            <VueIcon icon="check_circle"/>
          </div>
        </div>
      </transition>

      <transition duration="500">
        <div v-if="status === 'Failed'" class="status-icon error">
          <div class="wrapper">
            <VueIcon icon="error"/>
          </div>
        </div>
      </transition>

      <div class="operations">
        <span v-if="operations">{{ operations }}</span>
        <VueIcon
          v-else
          icon="more_horiz"
          class="blank-icon"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'mode'
    ])
  },

  sharedData () {
    return mapSharedData('webpack-dashboard-', {
      status: `${this.mode}-status`,
      progress: `${this.mode}-progress`,
      operations: `${this.mode}-operations`
    })
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.build-progress
  .content
    v-box()
    box-center()
    position relative
    height 100%

    >>> > *
      space-between-y($padding-item)

  .vue-progress-path
    >>> .background
      stroke rgba($vue-ui-color-dark, .1)
      .vue-ui-dark-mode &
        stroke $vue-ui-color-darker

  .operations
    color $vue-ui-color-dark
    padding-bottom 12px
    .vue-ui-dark-mode &
      color lighten($vue-ui-color-dark, 60%)
    &:first-letter
      text-transform uppercase

  .progress,
  .status-icon
    h-box()
    box-center()
    flex none
    position absolute
    top 0
    left 0
    width 100%
    height 178px

  .progress
    color lighten($vue-ui-color-dark, 60%)
    font-weight lighter
    font-size 42px

  .status-icon
    .wrapper
      position relative
      .vue-ui-icon
        width 64px
        height @width
        position relative
        z-index 2
        display block
      &::before,
      &::after
        display block
        content ''
        border-radius 50%
        position absolute
      &::before
        top -36px
        left @top
        width 136px
        height @width
      &::after
        background white
        top 7px
        left @top
        width 50px
        height @width
        z-index 1
    &.done
      .wrapper::before
        background $vue-ui-color-success
      >>> svg
        fill $vue-ui-color-success
    &.error
      .wrapper::before
        background $vue-ui-color-danger
      >>> svg
        fill $vue-ui-color-danger
    &.v-enter-active,
    &.v-leave-active
      transition transform .5s cubic-bezier(0, 1, .3, 1), opacity .2s
      .wrapper::after
        transition opacity .2s
      .vue-ui-icon
        transition opacity 0
    &.v-enter-active
      .wrapper::after,
      .vue-ui-icon
        transition-delay .3s
    &.v-enter,
    &.v-leave-to
      transform scale(0)
      .wrapper::after
        opacity 0
    &.v-enter
      .vue-ui-icon
        opacity 0
    &.v-leave-to
      opacity 0
</style>
