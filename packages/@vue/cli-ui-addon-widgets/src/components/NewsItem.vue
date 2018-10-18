<template>
  <div class="news-item list-item">
    <div class="info">
      <div class="head">
        <div class="title">
          <a
            :href="item.link"
            target="_blank"
            @click.stop
          >
            {{ item.title }}
          </a>
        </div>
        <div class="snippet">{{ snippet }}</div>
        <div class="date">{{ item.pubDate | date }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },

  computed: {
    snippet () {
      const text = this.item.contentSnippet
      if (text.length > 200) {
        return text.substr(0, 197) + '...'
      }
      return text
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.news-item
  padding ($padding-item / 2) $padding-item $padding-item

.title
  margin-bottom ($padding-item /2)

.snippet,
.date
  font-size 14px

.date
  opacity .5
</style>
