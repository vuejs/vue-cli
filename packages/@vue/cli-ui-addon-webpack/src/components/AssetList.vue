<template>
  <div class="asset-list card list-block">
    <div class="content">
      <div class="title">
        {{ $t('org.vue.vue-webpack.dashboard.asset-list.title') }}
      </div>

      <VueIcon
        v-if="!assetsSorted.length"
        icon="more_horiz"
        class="blank-icon"
      />

      <template v-else>
        <div class="headers">
          <div class="header"></div>
          <div class="header size-field">{{ sizeField }}</div>
          <div class="header">Global</div>
          <div class="header">3G Slow</div>
          <div class="header">3G Fast</div>
          <div class="header"></div>
        </div>

        <div class="list">
          <AssetListItem
            v-for="asset of assetsSorted"
            :key="asset.name"
            :asset="asset"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import AssetListItem from './AssetListItem'

export default {
  components: {
    AssetListItem
  },

  computed: {
    ...mapGetters([
      'assetsSorted',
      'sizeField'
    ])
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.headers
  display grid
  grid-template-columns 5fr repeat(4, 1fr) 16px
  grid-gap $padding-item
  font-family $font-mono
  font-size 12px
  text-align right
  margin-bottom $padding-item

  .size-field
    &:first-letter
      text-transform uppercase
</style>
