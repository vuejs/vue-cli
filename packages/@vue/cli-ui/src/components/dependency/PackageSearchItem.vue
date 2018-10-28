<template>
  <div
    class="package-search-item list-item"
    :class="{
      selected
    }"
  >
    <ItemLogo
      :image="logoUrl"
      :selected="selected"
      fallback-icon="extension"
    />

    <ListItemInfo
      :link="pkg.homepage || (pkg.repository && pkg.repository.url) || ''"
      :selected="selected"
      show-description
    >
      <template slot="name">
        <span class="name" data-testid="name">
          <ais-highlight
            :result="pkg"
            attribute-name="name"
          />
        </span>
        <span class="version">{{ pkg.version }}</span>
      </template>
      <template slot="description">
        <span
          class="info description"
          v-tooltip="pkg.description"
        >
          <ais-highlight
            :result="pkg"
            attribute-name="description"
          />
        </span>
        <span v-if="official" class="info">
          <VueIcon icon="star" class="top medium"/>
          <span>{{ $t('org.vue.components.project-plugin-item.official') }}</span>
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
    },

    tryLogo: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      logoUrl: null
    }
  },

  computed: {
    official () {
      return this.pkg.owner.name === 'vuejs'
    }
  },

  watch: {
    'pkg.name': {
      handler: 'updateLogo',
      immediate: true
    }
  },

  methods: {
    updateLogo () {
      // By default, show the npm user avatar
      this.logoUrl = this.pkg.owner.avatar

      // Try to load the logo.png file inside the package
      if (this.tryLogo) {
        const name = this.pkg.name
        const img = new Image()
        img.onload = () => {
          if (name !== this.pkg.name) return
          this.logoUrl = img.src
        }
        img.src = `https://unpkg.com/${name}/logo.png`
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.package-search-item
  padding $padding-item
  h-box()
  box-center()

  .list-item-info
    flex 100% 1 1
    width 0
    >>> .description
      display inline-flex
      align-items baseline

  .name
    font-weight bold

  .version
    color $color-text-light
    margin-left 6px

  .info
    space-between-x(6px)

    &.description
      font-style italic
      max-width 550px
      white-space nowrap
      text-overflow ellipsis
      display block
      overflow hidden

    &.downloads
      text-transform uppercase

    &.owner
      .vue-ui-icon
        margin-right 2px
</style>
