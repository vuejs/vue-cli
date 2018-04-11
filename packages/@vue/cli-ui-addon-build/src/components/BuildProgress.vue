<template>
  <div class="build-progress">
    <div class="content">
      <loading-progress
        :progress="progress"
        size="128"
        counter-clockwise
      />

      <div class="progress">
        {{ Math.round(progress * 100) }}
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
  computed: {
    ...mapGetters([
      'mode'
    ])
  },

  sharedData () {
    return mapSharedData('webpack-dashboard-', {
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

  .operations
    color $vue-ui-color-dark
    padding-bottom 12px
    &:first-letter
      text-transform uppercase

  .progress
    h-box()
    box-center()
    flex none
    position absolute
    top 0
    left 0
    width 100%
    height 178px
    color lighten($vue-ui-color-dark, 60%)
    font-weight lighter
    font-size 42px
</style>
