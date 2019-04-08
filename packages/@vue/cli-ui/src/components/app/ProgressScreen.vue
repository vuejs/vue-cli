<template>
  <transition name="vue-ui-fade">
    <div
      v-if="progress"
      class="loading-screen"
      :class="{
        loading
      }"
    >
      <VueLoadingIndicator
        class="primary big overlay fixed"
      >
        <div class="content">
          <div v-if="progress.error" class="error">
            <VueIcon
              icon="error"
              class="huge"
            />
            <div>{{ progress.error }}</div>
            <div class="actions">
              <VueButton
                icon-left="close"
                :label="$t('org.vue.components.progress-screen.close')"
                @click="close()"
              />
            </div>
          </div>

          <template v-else>
            <div v-if="statusMessage" class="status">
              {{ statusMessage }}
            </div>

            <div class="secondary-info">
              <div
                v-if="progress.info"
                class="info"
                v-html="ansiColors(progress.info)"
              />

              <VueLoadingBar
                v-if="progress.progress !== -1"
                :value="progress.progress"
              />

              <div v-if="debug" class="debug"><pre>{{ debug }}</pre></div>
            </div>
          </template>
        </div>
      </VueLoadingIndicator>
    </div>
  </transition>
</template>

<script>
import { DisableScroll } from '@vue/ui'
import Progress from '@/mixins/Progress'

export default {
  mixins: [
    DisableScroll,
    Progress
  ],

  props: {
    debug: String
  },

  methods: {
    close () {
      this.progress = null
    }
  }
}
</script>

<style lang="stylus" scoped>
.loading-screen
  position absolute
  z-index 900

  .content
    display grid
    grid-template-columns 1fr
    grid-gap $padding-item
    text-align center

    .error
      color $vue-ui-color-danger
      v-box()
      box-center()
      > .vue-ui-icon
        margin-bottom $padding-item
        >>> svg
          fill @color
      .actions
        margin-top $padding-item

    .secondary-info
      position absolute
      bottom 42px
      left 0
      right 0
      v-box()
      box-center()

    .info
      color $color-text-light

    .debug
      color $vue-ui-color-warning
      font-size 10px

    .vue-ui-loading-bar
      width 50vw
      max-width 400px
      margin-top 24px

  &:not(.loading)
    .vue-ui-loading-indicator
      >>> .animation
        display none

  &.loading
    .content
      margin-top $padding-item
</style>
