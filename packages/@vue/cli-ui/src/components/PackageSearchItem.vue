<template>
  <div
    class="package-search-item list-item"
    :class="{
      selected
    }"
  >
    <ItemLogo
      :image="pkg.owner.avatar"
      :selected="selected"
    />

    <ListItemInfo
      :link="pkg.repository && pkg.repository.url || ''"
      :selected="selected"
      show-description
    >
      <template slot="name">
        <span class="name">
          <ais-highlight
            :result="pkg"
            attribute-name="name"
          />
        </span>
        <span class="version">{{ pkg.version }}</span>
      </template>
      <template slot="description">
        <span class="info description">
          <ais-highlight
            :result="pkg"
            attribute-name="description"
          />
        </span>
        <span class="info downloads">
          <VueIcon class="medium" icon="file_download"/>
          <span>{{ pkg.humanDownloadsLast30Days }}</span>
        </span>
        <span class="info owner">
          <VueIcon class="medium" icon="account_circle"/>
          <span>{{ pkg.owner.name }}</span>
        </span>
      </template>
    </ListItemInfo>
  </div>
</template>

<script>
export default {
  props: {
    pkg: {
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
@import "~@/style/imports"

.package-search-item
  padding $padding-item
  h-box()
  box-center()

  .list-item-info
    flex 100% 1 1
    width 0

  .name
    font-weight bold

  .version
    color $color-text-light
    margin-left 6px

  .info
    space-between-x(6px)

  .description
    font-style italic

  .downloads
    text-transform uppercase

  .owner
    .vue-icon
      margin-right 2px
</style>
