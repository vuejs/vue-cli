<template>
  <div
    class="news"
    :class="{
      details: widget.isDetails,
      small,
      'has-item-selected': selectedItem
    }"
  >
    <div
      v-if="loading"
      class="loading"
    >
      <VueLoadingIndicator/>
    </div>
    <div
      v-else-if="error"
      class="error vue-ui-empty"
    >
      <VueIcon :icon="errorData.icon" class="huge"/>
      <div>{{ $t(`org.vue.widgets.news.errors.${error}`) }}</div>
    </div>
    <div
      v-else
      class="panes"
    >
      <div class="feed">
        <NewsItem
          v-for="(item, index) of feed.items"
          :key="index"
          :item="item"
          :class="{
            selected: selectedItem === item
          }"
          @click.native="selectedItem = item"
        />
      </div>

      <transition>
        <div
          v-if="selectedItem"
          class="item-details"
        >
          <div v-if="small" class="back">
            <VueButton
              icon-left="arrow_back"
              :label="$t('org.vue.common.back')"
              @click="selectedItem = null"
            />
          </div>

          <NewsItemDetails
            v-if="selectedItem"
            :item="selectedItem"
          />
        </div>

        <div v-else-if="!small" class="select-tip vue-ui-empty">
          <VueIcon icon="rss_feed" class="huge"/>
          <div>{{ $t('org.vue.widgets.news.select-tip') }}</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import NewsItem from './NewsItem.vue'
import NewsItemDetails from './NewsItemDetails.vue'

const ERRORS = {
  fetch: {
    icon: 'error'
  },
  offline: {
    icon: 'cloud_off'
  },
  empty: {
    icon: 'cake'
  }
}

export default {
  components: {
    NewsItem,
    NewsItemDetails
  },

  inject: [
    'widget'
  ],

  data () {
    return {
      loading: false,
      feed: null,
      error: null,
      selectedItem: null
    }
  },

  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    errorData () {
      if (this.error) {
        return ERRORS[this.error]
      }
    },

    small () {
      return !this.widget.isDetails && this.widget.data.width < 5
    }
  },

  watch: {
    'widget.data.config.url': {
      handler () {
        this.fetchFeed()
      },
      immediate: true
    }
  },

  created () {
    this.widget.addHeaderAction({
      id: 'refresh',
      icon: 'refresh',
      tooltip: 'org.vue.widgets.news.refresh',
      disabled: () => this.loading,
      onCalled: () => {
        this.fetchFeed(true)
      }
    })
  },

  methods: {
    async fetchFeed (force = false) {
      this.selectedItem = null

      if (!navigator.onLine) {
        this.loading = false
        this.error = 'offline'
        return
      }

      this.loading = true
      this.error = false
      this.widget.customTitle = null
      try {
        const { results, errors } = await this.$callPluginAction('org.vue.widgets.actions.fetch-news', {
          url: this.widget.data.config.url,
          force
        })
        if (errors.length && errors[0]) throw new Error(errors[0])

        this.feed = results[0]
        if (!this.feed.items.length) {
          this.error = 'empty'
        }

        this.widget.customTitle = this.feed.title
      } catch (e) {
        this.error = 'fetch'
        // eslint-disable-next-line no-console
        console.error(e)
      }
      this.loading = false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.loading,
.panes,
.feed
  height 100%

.loading
  h-box()
  box-center()

.panes
  display flex
  align-items stretch

.feed
  overflow-x hidden
  overflow-y auto

.item-details,
.select-tip
  flex 1
  height 100%

.item-details
  overflow-x hidden
  overflow-y auto
  .back
    padding $padding-item

.select-tip
  v-box()
  box-center()

.error
  height 100%
  v-box()
  box-center()
  padding-bottom 42px

.news
  &:not(.small)
    padding ($padding-item / 2) 0 $padding-item $padding-item
    .feed
      width 400px
      background lighten($vue-ui-color-light-neutral, 50%)
      border-radius $br
      .vue-ui-dark-mode &
        background $content-bg-list-dark

  &.small
    .panes
      position relative

    .feed
      transition transform .3s cubic-bezier(0,1,.32,1)

    .item-details
      position absolute
      top 0
      left 0
      width 100%
      transition transform .15s ease-out
      background $vue-ui-color-light
      .vue-ui-dark-mode &
        background $vue-ui-color-darker
      &.v-enter-active,
      &.v-enter-leave
        transition transform .3s cubic-bezier(0,1,.32,1)
      &.v-enter,
      &.v-leave-to
        transform translateX(100%)

    &.has-item-selected
      .feed
        transform translateX(-100%)
</style>
