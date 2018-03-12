<template>
  <div class="project-plugin-item list-item">
    <ItemLogo :image="plugin.logo"/>

    <ListItemInfo
      :name="plugin.id"
      :link="plugin.website"
      show-description
    >
      <span slot="description" class="plugin-description">
        <span class="info version">
          <span class="label">version</span>
          <span class="value">{{ plugin.version.current }}</span>
        </span>

        <span class="info latest">
          <span class="label">latest</span>
          <VueIcon
            v-if="plugin.version.current !== plugin.version.latest"
            icon="warning"
            class="top medium"
          />
          <span class="value">{{ plugin.version.latest }}</span>
        </span>

        <span v-if="plugin.official" class="info">
          <VueIcon
            icon="star"
            class="top medium"
          />
          Official
        </span>

        <span v-if="plugin.installed" class="info">
          <VueIcon
            icon="check_circle"
            class="top medium"
          />
          Installed
        </span>

        <span v-if="plugin.description" class="package-description">
          {{ plugin.description }}
        </span>
      </span>
    </ListItemInfo>
  </div>
</template>

<script>
export default {
  props: {
    plugin: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-plugin-item
  padding $padding-item
  h-box()
  box-center()

  .list-item-info
    flex 100% 1 1
    width 0

  .plugin-description
    margin-right $padding-item

  .label
    opacity .7

  .info
    display inline-block
    space-between-x($padding-item)
    >>> > *
      space-between-x(4px)

  .package-description
    font-style italic
    opacity .7

</style>
