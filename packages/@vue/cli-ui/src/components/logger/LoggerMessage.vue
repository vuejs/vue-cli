<template>
  <div
    class="logger-message"
    :class="[
      `type-${message.type}`,
      {
        'has-type': message.type !== 'log',
        'has-tag': message.tag,
        pre
      }
    ]"
  >
    <div v-if="message.type !== 'log'" class="type">{{ message.type }}</div>
    <div v-if="message.tag" class="tag">{{ message.tag }}</div>
    <div class="message" v-html="ansiColors(message.message)"/>
    <div class="date">{{ message.date | date }}</div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    },

    pre: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus" scoped>
.logger-message
  h-box()
  align-items baseline
  font-family $font-mono
  box-sizing border-box
  padding 2px 4px

  .type,
  .tag
    padding 2px 6px
    border-radius $br

  .type
    text-transform uppercase

  &.type-warn
    .type
      background $vue-ui-color-warning
      color $vue-ui-color-light
  &.type-error
    .type
      background $vue-ui-color-danger
      color $vue-ui-color-light
  &.type-info
    .type
      background $vue-ui-color-info
      color $vue-ui-color-light
  &.type-done
    .type
      background $vue-ui-color-success
      color $vue-ui-color-light

  .tag
    background lighten($vue-ui-color-dark, 60%)

  &.has-type.has-tag
    .type
      border-top-right-radius 0
      border-bottom-right-radius 0
    .tag
      border-top-left-radius 0
      border-bottom-left-radius 0

  .message
    flex 100% 1 1
    width 0
    ellipsis()

  &.has-type,
  &.has-tag
    .message
      margin-left 12px

  &.pre
    .message
      white-space pre-wrap

  .date
    opacity .5
</style>
