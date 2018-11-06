<template>
  <div class="project-plugin-item list-item">
    <div class="content">
      <div
        v-if="!visible"
        v-observe-visibility="visibilityChanged"
      />

      <ItemLogo
        :image="pluginLogo && pluginLogo.logo"
        fallback-icon="extension"
      />

      <ListItemInfo
        :name="plugin.id"
        :link="plugin.website"
        show-description
      >
        <span slot="description" class="plugin-description">
          <span class="info version">
            <span class="label">{{ $t('org.vue.components.project-plugin-item.version') }}</span>
            <span class="value">{{ pluginDetails && pluginDetails.version.current }}</span>
          </span>

          <span class="info latest">
            <span class="label">{{ $t('org.vue.components.project-plugin-item.latest') }}</span>
            <VueIcon
              v-if="pluginDetails && pluginDetails.version.current !== pluginDetails.version.latest"
              icon="warning"
              class="top medium"
            />
            <span class="value">{{ pluginDetails && pluginDetails.version.latest }}</span>
          </span>

          <span v-if="plugin.official" class="info">
            <VueIcon
              icon="star"
              class="top medium"
            />
            {{ $t('org.vue.components.project-plugin-item.official') }}
          </span>

          <span v-if="plugin.installed" class="info">
            <template v-if="isLocal">
              <VueIcon
                icon="folder"
                class="top medium"
              />
              <span v-tooltip="pluginDetails.version.localPath">
                {{ $t('org.vue.components.project-plugin-item.local') }}
              </span>
            </template>
            <template v-else>
              <VueIcon
                icon="check_circle"
                class="top medium"
              />
              {{ $t('org.vue.components.project-plugin-item.installed') }}
            </template>
          </span>

          <span v-if="pluginDetails && pluginDetails.description" class="package-description">
            {{ pluginDetails.description }}
          </span>
        </span>
      </ListItemInfo>

      <VueButton
        v-if="isLocal"
        icon-left="cached"
        class="icon-button"
        v-tooltip="$t('org.vue.components.project-plugin-item.actions.refresh', { target: plugin.id })"
        :loading-left="updating"
        @click="e => updatePlugin(!e.shiftKey)"
      />

      <VueButton
        v-else-if="pluginDetails && pluginDetails.version.current !== pluginDetails.version.wanted"
        icon-left="file_download"
        class="icon-button"
        v-tooltip="$t('org.vue.components.project-plugin-item.actions.update', { target: plugin.id })"
        :loading-left="updating"
        @click="updatePlugin()"
      />
    </div>
  </div>
</template>

<script>
import PLUGIN_DETAILS from '@/graphql/plugin/pluginDetails.gql'
import PLUGIN_LOGO from '@/graphql/plugin/pluginLogo.gql'
import PLUGIN_UPDATE from '@/graphql/plugin/pluginUpdate.gql'

export default {
  props: {
    plugin: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      pluginDetails: null,
      pluginLogo: null,
      updating: false,
      visible: false
    }
  },

  apollo: {
    pluginDetails: {
      query: PLUGIN_DETAILS,
      variables () {
        return {
          id: this.plugin.id
        }
      },
      skip () {
        return !this.visible
      }
    },

    pluginLogo: {
      query: PLUGIN_LOGO,
      variables () {
        return {
          id: this.plugin.id
        }
      }
    }
  },

  computed: {
    isLocal () {
      return this.pluginDetails && this.pluginDetails.version.localPath
    }
  },

  methods: {
    async updatePlugin (full = true) {
      this.updating = true
      try {
        this.$apollo.mutate({
          mutation: PLUGIN_UPDATE,
          variables: {
            id: this.plugin.id,
            full
          }
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
      this.updating = false
    },

    visibilityChanged (isVisible) {
      if (!this.visible) {
        this.visible = isVisible
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-plugin-item
  padding $padding-item
  cursor default

  .content
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

  .description
    height 21px

  .version,
  .latest
    min-width 130px
    .value
      font-family monospace
      font-size .9em

  .package-description
    font-style italic
    opacity .7
    display inline-block
    max-width 300px
    ellipsis()
    position relative
    top 4px

</style>
