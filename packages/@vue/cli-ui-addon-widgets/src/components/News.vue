<template>
  <div class="news">
    <div
      v-if="loading"
      class="loading"
    >
      <VueLoadingIndicator/>
    </div>
    <div
      v-else
      class="feed"
    >
      <NewsItem
        v-for="(item, index) of feed.items"
        :key="index"
        :item="item"
      />
    </div>
  </div>
</template>

<script>
import Parser from 'rss-parser'

import NewsItem from './NewsItem.vue'

const parser = new Parser()

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'

export default {
  components: {
    NewsItem
  },

  inject: [
    'widget'
  ],

  data () {
    return {
      loading: false,
      feed: null
    }
  },

  watch: {
    'widget.data.config.url': {
      handler: 'fetchFeed',
      immediate: true
    }
  },

  methods: {
    async fetchFeed () {
      this.loading = true
      try {
        this.feed = await parser.parseURL(CORS_PROXY + this.widget.data.config.url)
      } catch (e) {
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
.feed
  height 100%

.loading
  h-box()
  box-center()

.feed
  overflow-x hidden
  overflow-y auto
</style>
