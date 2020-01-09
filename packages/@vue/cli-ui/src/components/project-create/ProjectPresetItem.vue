<template>
  <div
    class="project-preset-item list-item"
    :class="{
      selected
    }"
    :data-testid="preset.id"
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

      <ListItemInfo
        :name="$t(preset.name)"
        :description="description || $t(preset.description)"
        :link="preset.link"
        :selected="selected"
      />
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
    },

    description: {
      type: String,
      default: null
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-preset-item
  padding $padding-item
  padding-left 0

  .content
    display grid
    grid-template-columns 64px auto
    grid-template-rows auto
    grid-template-areas "icon info"

  .radio-icon
    h-box()
    box-center()
    grid-area icon

  .list-item-info
    grid-area info

  &.selected
    .radio-icon
      >>> svg
        fill $vue-ui-color-primary

</style>
