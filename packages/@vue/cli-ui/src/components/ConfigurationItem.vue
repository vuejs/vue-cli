<template>
  <div
    class="configuration-item list-item"
    :class="{
      selected
    }"
    v-tooltip.right="$t(configuration.description)"
  >
    <div class="content">
      <ItemLogo
        :file-icon="iconClass"
      />

      <ListItemInfo
        :name="configuration.name"
        :description="$t(configuration.description)"
        :selected="selected"
      />
    </div>
  </div>
</template>

<script>
import icons from 'file-icons-js'

export default {
  props: {
    configuration: {
      type: Object,
      required: true
    },

    selected: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    iconClass () {
      return icons.getClassWithColor(this.getFileName(this.configuration.icon) || this.configuration.id) || 'gear-icon medium-blue'
    }
  },

  methods: {
    getFileName (icon) {
      if (icon) {
        if (!icon.includes('.')) return `f.${icon}`
        return icon
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.configuration-item
  padding $padding-item

  .content
    h-box()
    box-center()

  .list-item-info
    flex auto 1 1
    width 0

    >>> .description
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
</style>
