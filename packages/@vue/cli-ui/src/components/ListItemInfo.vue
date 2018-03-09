<template>
  <div
    class="list-item-info"
    :class="{
      selected
    }"
  >
    <div class="name">{{ name }}</div>
    <div v-if="description || link" class="description">
      {{ description }}
      <a
        v-if="link"
        :href="link"
        target="_blank"
        @click.stop="() => {}"
      >
        More info
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    description: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: null
    },

    name: {
      type: String,
      required: true
    },

    selected: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.list-item-info
  v-box()
  align-items stretch
  justify-content center

  .description
    color $color-text-light

  &.selected
    .name
      color $vue-color-primary
</style>
