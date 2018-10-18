<template>
  <div class="news">
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
import NewsItem from './NewsItem.vue'

const ERRORS = {
  'fetch': {
    icon: 'error'
  },
  'offline': {
    icon: 'cloud_off'
  },
  'empty': {
    icon: 'cake'
  }
}

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
      feed: null,
      error: null
    }
  },

  computed: {
    errorData () {
      if (this.error) {
        return ERRORS[this.error]
      }
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
      if (!navigator.onLine) {
        this.loading = false
        this.error = 'offline'
        return
      }

      this.loading = true
      this.error = false
      try {
        const { results, errors } = await this.$callPluginAction('org.vue.widgets.actions.fetch-news', {
          url: this.widget.data.config.url
        })
        if (errors.length && errors[0]) throw new Error(errors[0])

        this.feed = results[0]
        if (!this.feed.items.length) {
          this.error = 'empty'
        }
      } catch (e) {
        this.error = 'fetch'
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

.error
  height 100%
  v-box()
  box-center()
  padding-bottom 42px
</style>
