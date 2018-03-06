<template>
  <div
    class="project-preset-item"
    :class="{
      selected
    }"
  >
    <div class="content">
      <div
        class="radio-icon"
      >
        <VueIcon
          :icon="selected ? 'radio_button_checked' : 'radio_button_unchecked'"
          class="medium"
        />
      </div>
      <div class="name">{{ preset.name }}</div>
      <div class="description">{{ preset.description }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    preset: {
      type: Object,
      required: true
    },

    selected: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-preset-item
  padding 12px
  padding-left 0
  user-select none
  cursor pointer

  .content
    display grid
    grid-template-columns 64px auto
    grid-template-rows repeat(2, 24px)
    grid-template-areas "icon name" "icon description"

  .radio-icon
    h-box()
    box-center()
    grid-area icon

  .name
    grid-area name

  .description
    grid-area description
    color lighten($vue-color-dark, 40%)

  &.selected
    background rgba($vue-color-primary, .05)
    .radio-icon
      >>> svg
        fill $vue-color-primary
    .name
      color $vue-color-primary

  &:hover
    background rgba($vue-color-primary, .1)

</style>
