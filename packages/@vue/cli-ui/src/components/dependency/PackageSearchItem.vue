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

    <div
      v-if="hasGenerator"
      class="feature"
      v-tooltip="$t('org.vue.components.project-plugin-item.features.generator')"
    >
      <VueIcon
        icon="note_add"
        class="big"
      />
    </div>
    <div
      v-if="hasUiIntegration"
      class="feature"
      v-tooltip="$t('org.vue.components.project-plugin-item.features.ui-integration')"
    >
      <VueIcon
        icon="brush"
        class="big"
      />
    </div>
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

    loadMetadata: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      logoUrl: null,
      hasGenerator: false,
      hasUiIntegration: false
    }
  },

  computed: {
    official () {
      return this.pkg.owner.name === 'vuejs'
    }
  },

  watch: {
    'pkg.name': {
      handler: 'updateMetadata',
      immediate: true
    }
  },

  methods: {
    updateMetadata () {
      const name = this.pkg.name

      this.hasUiIntegration = false
      this.hasGenerator = false
      // By default, show the npm user avatar
      this.logoUrl = this.pkg.owner.avatar

      // Try to load the logo.png file inside the package
      if (this.loadMetadata) {
        const img = new Image()
        img.onload = () => {
          if (name !== this.pkg.name) return
          this.logoUrl = img.src
        }
        img.src = `https://unpkg.com/${name}/logo.png`

        fetch(`https://unpkg.com/${name}/ui`).then(response => {
          if (name !== this.pkg.name) return
          this.hasUiIntegration = response.ok
        })

        fetch(`https://unpkg.com/${name}/generator`).then(response => {
          if (name !== this.pkg.name) return
          this.hasGenerator = response.ok
        })
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

  .feature
    margin-right 12px
    opacity .3
    &:hover
      opacity 1
</style>
