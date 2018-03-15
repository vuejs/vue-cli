<template>
  <div
    class="list-item-info"
    :class="{
      selected
    }"
  >
    <div class="name">
      <slot name="name">
        {{ name }}
      </slot>
    </div>
    <div v-if="description || link || showDescription" class="description">
      <slot name="description">
        {{ description }}
      </slot>
      <a
        v-if="link"
        :href="link"
        target="_blank"
        class="more-info"
        @click.stop="() => {}"
      >
        <VueIcon icon="open_in_new" class="medium top"/>
        {{ $t('components.list-item-info.more-info') }}
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
      default: null
    },

    selected: {
      type: Boolean,
      default: false
    },

    showDescription: {
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

    >>> .vue-icon
      svg
        fill @color

    .more-info
      color $vue-color-primary
      padding 0 4px 0 2px
      border-radius $br
      .vue-icon
        >>> svg
          fill @color
      &:hover
        color $vue-color-light
        background $vue-color-primary
        .vue-icon
          >>> svg
            fill @color
      &:active
        background darken($vue-color-primary, 10%)

  &.selected
    .name
      color $vue-color-primary
</style>
