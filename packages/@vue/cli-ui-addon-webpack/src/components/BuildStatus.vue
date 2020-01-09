<template>
  <div class="build-status card">
    <div class="content">
      <div class="info-block status">
        <div class="label">
          {{ $t('org.vue.vue-webpack.dashboard.build-status.labels.status') }}
        </div>
        <div class="value">{{ $t(`org.vue.vue-webpack.dashboard.webpack-status.${status || 'Idle'}`) }}</div>
      </div>
      <div
        class="info-block errors"
        :class="{
          emphasize: errors.length
        }"
      >
        <div class="label">
          {{ $t('org.vue.vue-webpack.dashboard.build-status.labels.errors') }}
        </div>
        <div class="value">{{ errors.length }}</div>
      </div>
      <div
        class="info-block warnings"
        :class="{
          emphasize: warnings.length
        }"
      >
        <div class="label">
          {{ $t('org.vue.vue-webpack.dashboard.build-status.labels.warnings') }}
        </div>
        <div class="value">{{ warnings.length }}</div>
      </div>
      <div class="info-block assets">
        <div class="label">
          {{ $t('org.vue.vue-webpack.dashboard.build-status.labels.assets') }}
        </div>
        <div class="value">
          {{ assetsTotalSize | size('B') }}
          <span class="secondary">
            ({{ $t(`org.vue.vue-webpack.sizes.${sizeField}`) }})
          </span>
        </div>
      </div>
      <div class="info-block modules">
        <div class="label">
          {{ $t('org.vue.vue-webpack.dashboard.build-status.labels.modules') }}
        </div>
        <div class="value">
          {{ modulesTotalSize | size('B') }}
          <span class="secondary">
            ({{ $t(`org.vue.vue-webpack.sizes.${sizeField}`) }})
          </span>
        </div>
      </div>
      <div class="info-block dep-modules">
        <div class="label">
          {{ $t('org.vue.vue-webpack.dashboard.build-status.labels.deps') }}
        </div>
        <div class="value">
          {{ depModulesTotalSize | size('B') }}
          <span class="secondary">
            {{ depSizeRatio | round(100) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { size, round } from '../filters'

export default {
  filters: {
    size,
    round
  },

  computed: {
    ...mapGetters([
      'sizeField',
      'mode',
      'errors',
      'warnings',
      'assetsTotalSize',
      'modulesTotalSize',
      'depModulesTotalSize'
    ]),

    depSizeRatio () {
      if (this.modulesTotalSize) {
        return this.depModulesTotalSize / this.modulesTotalSize * 100
      } else {
        return 0
      }
    }
  },

  sharedData () {
    return {
      status: `org.vue.webpack.${this.mode}-status`
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.build-status
  .content
    height 100%
    display grid
    grid-template-columns repeat(3, 1fr)
    grid-gap $padding-item

  .info-block
    &.emphasize
      .value
        font-weight bold
      &.errors .value
        color $vue-ui-color-danger !important
      &.warnings .value
        color $vue-ui-color-warning !important
</style>
