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
        :image="configuration.icon || (configuration.plugin && configuration.plugin.logo)"
        fallback-icon="settings_applications"
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
  }
}
</script>

<style lang="stylus" scoped>
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
