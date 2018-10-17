<template>
  <div class="vue-webpack-dashboard">
    <div class="pane-toolbar card">
      <VueIcon icon="dashboard"/>
      <div class="title">{{ $t('org.vue.vue-webpack.dashboard.title') }}</div>

      <template
        v-if="mode === 'serve'"
      >
        <VueButton
          icon-left="open_in_browser"
          :label="$t('org.vue.vue-webpack.dashboard.open-app')"
          :disabled="!serveUrl"
          :href="serveUrl"
          target="_blank"
        />
        <VueIcon
          icon="lens"
          class="separator"
        />
      </template>

      <VueSwitch
        v-if="mode !== 'serve' && modernMode"
        v-model="showModernBuild"
      >
        {{ $t('org.vue.vue-webpack.modern-mode') }}
      </VueSwitch>

      <VueSelect v-model="sizeField">
        <VueSelectButton value="stats" :label="`${$t('org.vue.vue-webpack.sizes.stats')}`"/>
        <VueSelectButton value="parsed" :label="`${$t('org.vue.vue-webpack.sizes.parsed')}`"/>
        <VueSelectButton value="gzip" :label="`${$t('org.vue.vue-webpack.sizes.gzip')}`"/>
      </VueSelect>

      <VueButton
        class="icon-button"
        icon-left="help"
        v-tooltip="$t('org.vue.vue-webpack.sizes.help')"
      />
    </div>

    <div class="content vue-ui-grid">
      <BuildStatus />
      <BuildProgress />
      <SpeedStats class="span-2"/>
      <AssetList />
      <ModuleList />
    </div>

    <div class="logo">
      <a href="https://webpack.js.org/" target="_blank">
        <img src="../assets/webpack.svg" class="webpack-logo">
      </a>
    </div>
  </div>
</template>

<script>
import Dashboard from '../mixins/Dashboard'

import BuildStatus from './BuildStatus'
import BuildProgress from './BuildProgress'
import SpeedStats from './SpeedStats'
import AssetList from './AssetList'
import ModuleList from './ModuleList'

export default {
  mixins: [
    Dashboard
  ],

  components: {
    BuildStatus,
    BuildProgress,
    SpeedStats,
    AssetList,
    ModuleList
  }
}
</script>

<style>
@import '~vue-progress-path/dist/vue-progress-path.css';
</style>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.vue-webpack-dashboard
  .content
    grid-template-columns 9fr 4fr
    grid-gap $padding-item

    >>>
      .title
        color lighten($vue-ui-color-dark, 60%)
        font-size 20px
        font-weight lighter
        text-align center
        margin-bottom $padding-item

      .list
        display grid
        grid-template-columns 1fr
        grid-gap 16px

      .info-block
        v-box()
        box-center()
        font-weight lighter
        text-align center

        .label
          color lighten($vue-ui-color-dark, 60%)
          font-size 20px

        .value
          color $vue-ui-color-dark
          font-size 24px
          .vue-ui-dark-mode &
            color $vue-ui-color-light

          .secondary
            opacity .75
            font-size 16px

  /deep/ .card
    padding $padding-item

  .pane-toolbar
    margin-bottom $padding-item

  .logo
    margin $padding-item 0
    v-box()
    box-center()
    .webpack-logo
      width 32px
      height @width
</style>
