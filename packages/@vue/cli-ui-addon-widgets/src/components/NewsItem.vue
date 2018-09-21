<template>
  <div class="news-item">
    <div class="info">
      <div class="head">
        <div class="title">
          <a
            :href="item.link"
            target="_blank"
          >
            {{ item.title }}
          </a>
        </div>
        <div class="snippet">{{ item.contentSnippet }}</div>
        <div class="date">{{ item.pubDate | date }}</div>
      </div>

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

.news-item
  padding ($padding-item / 2) $padding-item
  &:not(:last-child)
    border-bottom rgba($vue-ui-color-primary, .3) solid 1px

.title
  margin-bottom ($padding-item /2)

.snippet,
.date
  font-size 14px

.date
  opacity .5

.media
  margin-top ($padding-item / 2)

.media-content
  max-width 100%
  max-height 100px
</style>
