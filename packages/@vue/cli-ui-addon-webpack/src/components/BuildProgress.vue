<template>
  <div
    class="build-progress card"
    :class="{
      [`mode-${mode}`]: true
    }"
  >
    <div class="content">
      <div class="progress-wrapper">
        <transition-group
          name="vue-ui-fade"
          class="progress-bars"
        >
          <div
            v-for="(key, index) of Object.keys(progress)"
            :key="key"
            class="progress-bar-wrapper"
          >
            <loading-progress
              :key="key"
              :progress="progress[key]"
              :size="128 - 16 * index"
              class="progress-bar"
              counter-clockwise
              :class="{
                'disable-animation': progress[key] === 0,
                [`mode-${key}`]: true
              }"
            />
          </div>
        </transition-group>

        <div class="progress">
          <div
            class="progress-animation"
            :class="{
               active: status && status !== 'Idle'
            }"
          >
            <div
              v-for="n in 4"
              :key="n"
              class="animation"
              :style="{
                'animation-delay': `${n * 0.25}s`
              }"
            />
          </div>
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
      </div>

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
  sharedData () {
    return mapSharedData('org.vue.webpack.', {
      status: `${this.mode}-status`,
      rawProgress: `${this.mode}-progress`,
      operations: `${this.mode}-operations`
    })
  },

  computed: {
    ...mapGetters([
      'mode'
    ]),

    progress () {
      const raw = this.rawProgress
      return raw && Object.keys(raw).length ? raw : { [this.mode]: 0 }
    }
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
    text-align center
    .vue-ui-dark-mode &
      color lighten($vue-ui-color-dark, 60%)
    &:first-letter
      text-transform uppercase

  .progress-wrapper
    width 178px
    height @width
    position relative

  .progress-bar-wrapper,
  .progress,
  .status-icon
    h-box()
    box-center()
    flex none
    position absolute
    top 0
    left 0
    width 100%
    height @width

  .progress-bar
    &.disable-animation
      >>> path
        transition none
    &.mode-build-modern
      >>> .progress
        stroke $vue-ui-color-info

  .progress-animation
    display grid
    $size = 12px
    grid-template-columns repeat(2, $size)
    grid-template-rows repeat(2, $size)
    grid-template-areas "z1 z4" "z2 z3"
    grid-gap 12px
    .animation
      width 100%
      height @width
      border-radius 50%
      background rgba(black, .1)
      transition background .15s
      for n in (1..4)
        &:nth-child({n})
          grid-area 'z%s' % n
    &.active
      .animation
        background $vue-ui-color-primary
        animation progress 1s infinite

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

  &.mode-build-modern
    .progress-animation.active
      .animation
        background $vue-ui-color-info

    .status-icon
      &.done
        .wrapper::before
          background $vue-ui-color-info
        >>> svg
          fill $vue-ui-color-info

@keyframes progress
  0%,
  30%
    transform none
  50%
    transform scale(1.5)
  80%
    transform none
</style>
