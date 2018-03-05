<template>
  <div class="project-nav">
    <div class="content">
      <VueGroup
        v-model="currentRoute"
        class="vertical small-indicator left-indicator primary"
        indicator
      >
        <VueGroupButton
          class="flat big icon-button"
          value="plugins"
          icon-left="widgets"
          v-tooltip.right="'Plugins'"
        />
        <VueGroupButton
          class="flat big icon-button"
          value="config"
          icon-left="settings_applications"
          v-tooltip.right="'Configurations'"
        />
        <VueGroupButton
          class="flat big icon-button"
          value="tasks"
          icon-left="assignment"
          v-tooltip.right="'Tasks'"
        />
      </VueGroup>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      currentRoute: 'plugins'
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-nav
  background $vue-color-dark

  .content
    v-box()

    >>> .vue-button
      button-colors(rgba($vue-color-light, .7), transparent)
      border-radius 0
      &:hover
        button-colors($vue-color-light, lighten($vue-color-dark, 10%))
        &.selected
          button-colors($vue-color-primary, lighten($vue-color-dark, 10%))
</style>
