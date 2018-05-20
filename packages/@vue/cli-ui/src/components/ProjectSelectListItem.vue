<template>
  <div class="project-select-list-item list-item">
    <div class="content">
      <div class="favorite">
        <VueButton
          class="icon-button"
          :icon-left="project.favorite ? 'star' : 'star_border'"
          v-tooltip="$t('components.project-select-list-item.tooltips.favorite')"
          data-testid="favorite-button"
          @click.stop="$emit('favorite')"
        />
      </div>
      <div class="info">
        <ListItemInfo
          :name="project.name"
          :description="project.path"
        />
      </div>
      <div class="actions">
        <VueButton
          class="icon-button"
          icon-left="delete"
          v-tooltip="$t('components.project-select-list-item.tooltips.delete')"
          data-testid="delete-button"
          @click.stop="$emit('remove')"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.content
  padding $padding-item
  display grid
  grid-template-columns auto 1fr auto
  grid-template-rows auto
  grid-template-areas "icon info actions"
  grid-gap $padding-item

.favorite
  grid-area icon
  h-box()
  box-center()

.info
  grid-area info

.actions
  grid-area actions
  h-box()
  align-items center

  >>> > *
    space-between-x($padding-item)
</style>
