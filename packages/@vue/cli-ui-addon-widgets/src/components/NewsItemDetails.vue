<template>
  <div class="news-item-details">
    <div class="head">
      <div class="title">
        <a
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.title }}
        </a>
      </div>
      <div class="date">{{ item.pubDate | date }}</div>
    </div>

    <div
      class="content"
      v-html="item['content:encoded'] || item.content"
    />

    <div
      v-if="item.enclosure"
      class="media"
    >
      <img
        v-if="item.enclosure.type.indexOf('image/') === 0"
        :src="item.enclosure.url"
        class="image media-content"
      />

      <audio
        v-if="item.enclosure.type.indexOf('audio/') === 0"
        :src="item.enclosure.url"
        controls
      />

      <video
        v-if="item.enclosure.type.indexOf('video/') === 0"
        :src="item.enclosure.url"
        controls
      />
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
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.news-item-details
  padding 0 $padding-item $padding-item
  overflow-x hidden
  overflow-y auto

.title
  font-size 18px
  margin-bottom ($padding-item /2)

.date
  font-size 14px
  opacity .5

.content,
.media
  margin-top $padding-item

.media-content,
.content >>> img,
.content >>> video
  max-width 100%
  max-height 300px
</style>
