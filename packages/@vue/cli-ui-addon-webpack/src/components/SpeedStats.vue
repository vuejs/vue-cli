<template>
  <div class="speed-stats card">
    <div class="content">
      <div class="title">
        {{ $t('org.vue.vue-webpack.dashboard.speed-stats.title') }}
      </div>

      <VueIcon
        v-if="!assetsTotalSize"
        icon="more_horiz"
        class="blank-icon"
      />

      <div v-else class="items">
        <SpeedStatsItem
          v-for="(stats, key) of speeds"
          :key="key"
          :stats="stats"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSpeeds } from '../util/assets'

import SpeedStatsItem from './SpeedStatsItem.vue'

export default {
  components: {
    SpeedStatsItem
  },

  computed: {
    ...mapGetters([
      'assetsTotalSize'
    ]),

    speeds () {
      return getSpeeds(this.assetsTotalSize)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.items
  display grid
  grid-template-columns repeat(auto-fill, 200px)
  grid-gap 16px
  justify-content space-between
  padding 16px
</style>
