<template>
  <div class="build-status">
    <div class="content">
      <div class="info-block status">
        <div class="label">Status</div>
        <div class="value">{{ status || 'Idle' }}</div>
      </div>
      <div class="info-block errors">
        <div class="label">Errors</div>
        <div class="value">{{ errors.length }}</div>
      </div>
      <div class="info-block warnings">
        <div class="label">Warnings</div>
        <div class="value">{{ warnings.length }}</div>
      </div>
      <div class="info-block assets">
        <div class="label">Assets</div>
        <div class="value">
          {{ assetsTotalSize | size('B') }}
          <span class="secondary">({{ sizeField }})</span>
        </div>
      </div>
      <div class="info-block modules">
        <div class="label">Modules</div>
        <div class="value">
          {{ modulesTotalSize | size('B') }}
          <span class="secondary">({{ sizeField }})</span>
        </div>
      </div>
      <div class="info-block dep-modules">
        <div class="label">Dependencies</div>
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
      status: `webpack-dashboard-${this.mode}-status`
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
</style>
