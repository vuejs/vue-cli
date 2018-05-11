<template>
  <div class="project-plugin-item list-item">
    <div class="content">
      <ItemLogo :image="pluginLogo && pluginLogo.logo"/>

      <ListItemInfo
        :name="plugin.id"
        :link="plugin.website"
        show-description
      >
        <span slot="description" class="plugin-description">
          <template v-if="pluginDetails">
            <span class="info version">
              <span class="label">{{ $t('components.project-plugin-item.version') }}</span>
              <span class="value">{{ pluginDetails.version.current }}</span>
            </span>

            <span class="info latest">
              <span class="label">{{ $t('components.project-plugin-item.latest') }}</span>
              <VueIcon
                v-if="pluginDetails.version.current !== pluginDetails.version.latest"
                icon="warning"
                class="top medium"
              />
              <span class="value">{{ pluginDetails.version.latest }}</span>
            </span>
          </template>

          <span v-if="plugin.official" class="info">
            <VueIcon
              icon="star"
              class="top medium"
            />
            {{ $t('components.project-plugin-item.official') }}
          </span>

          <span v-if="plugin.installed" class="info">
            <VueIcon
              icon="check_circle"
              class="top medium"
            />
            {{ $t('components.project-plugin-item.installed') }}
          </span>

          <span v-if="pluginDetails && pluginDetails.description" class="package-description">
            {{ pluginDetails.description }}
          </span>
        </span>
      </ListItemInfo>

      <VueButton
        v-if="pluginDetails && pluginDetails.version.current !== pluginDetails.version.wanted"
        icon-left="file_download"
        class="icon-button"
        v-tooltip="$t('components.project-plugin-item.actions.update', { target: plugin.id })"
        :loading-left="updating"
        @click="updatePlugin()"
      />
    </div>
  </div>
</template>

<script>
import PLUGIN_DETAILS from '../graphql/pluginDetails.gql'
import PLUGIN_LOGO from '../graphql/pluginLogo.gql'
import PLUGIN_UPDATE from '../graphql/pluginUpdate.gql'

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
      updating: false
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
      fetchPolicy: 'cache-and-network'
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

  methods: {
    async updatePlugin () {
      this.updating = true
      try {
        this.$apollo.mutate({
          mutation: PLUGIN_UPDATE,
          variables: {
            id: this.plugin.id
          }
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
      this.updating = false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

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

  .package-description
    font-style italic
    opacity .7

</style>
