<template>
  <div class="project-nav">
    <div class="content">
      <VueGroup
        v-model="currentRoute"
        class="vertical small-indicator left-indicator primary"
        indicator
      >
        <VueGroupButton
          v-for="route of routes"
          :key="route.name"
          class="flat big icon-button"
          :value="route.name"
          :icon-left="route.icon"
          v-tooltip.right="route.tooltip"
        />
      </VueGroup>
    </div>
  </div>
</template>

<script>
const BUILTIN_ROUTES = [
  {
    name: 'project-plugins',
    icon: 'widgets',
    tooltip: 'Plugins'
  },
  {
    name: 'project-configuration',
    icon: 'settings_applications',
    tooltip: 'Configuration'
  },
  {
    name: 'project-tasks',
    icon: 'assignment',
    tooltip: 'Tasks'
  }
]

export default {
  data () {
    return {
      currentRoute: null,
      routes: [
        ...BUILTIN_ROUTES
        // Plugins routes here
        // TODO
      ]
    }
  },

  watch: {
    currentRoute (name) {
      if (this.$route.name !== name) {
        this.$router.push({ name })
      }
    },

    '$route.name': {
      handler (value) {
        if (value !== this.currentRoute) {
          this.currentRoute = value
        }
      },
      immediate: true
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
        $bg = darken($vue-color-dark, 70%)
        button-colors($vue-color-light, $bg)
        &.selected
          button-colors(lighten($vue-color-primary, 40%), $bg)
</style>
