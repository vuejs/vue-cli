<template>
  <div class="project-dependency-item list-item">
    <div class="content">
      <div
        v-if="!visible"
        v-observe-visibility="visibilityChanged"
      />

      <ItemLogo
        :image="image || 'widgets'"
        fallback-icon="widgets"
        class="identicon"
      />

      <ListItemInfo
        :name="dependency.id"
        :link="dependency.website"
        show-description
      >
        <span slot="description" class="dependency-description">
          <span class="info version">
            <span class="label">{{ $t('org.vue.components.project-dependency-item.version') }}</span>
            <span class="value">{{ dependencyDetails && dependencyDetails.version.current }}</span>
          </span>

          <span class="info wanted">
            <span class="label">{{ $t('org.vue.components.project-dependency-item.wanted') }}</span>
            <VueIcon
              v-if="dependencyDetails && dependencyDetails.version.current !== dependencyDetails.version.wanted"
              icon="warning"
              class="top medium"
            />
            <span class="value">{{ dependencyDetails && dependencyDetails.version.wanted }}</span>
          </span>

          <span class="info latest">
            <span class="label">{{ $t('org.vue.components.project-dependency-item.latest') }}</span>
            <VueIcon
              v-if="dependencyDetails && dependencyDetails.version.current !== dependencyDetails.version.latest"
              icon="warning"
              class="top medium"
            />
            <span class="value">{{ dependencyDetails && dependencyDetails.version.latest }}</span>
          </span>

          <span v-if="dependency.installed" class="info installed">
            <VueIcon
              icon="check_circle"
              class="top medium"
            />
            {{ $t('org.vue.components.project-dependency-item.installed') }}
          </span>

          <span v-if="dependencyDetails && dependencyDetails.description" class="package-description">
            {{ dependencyDetails.description }}
          </span>
        </span>
      </ListItemInfo>

      <VueButton
        v-if="dependencyDetails && dependencyDetails.version.current !== dependencyDetails.version.wanted"
        icon-left="file_download"
        class="icon-button"
        v-tooltip="$t('org.vue.components.project-dependency-item.actions.update', { target: dependency.id })"
        :loading-left="updating"
        @click="updateDependency()"
      />
      <VueButton
        icon-left="delete"
        class="icon-button"
        v-tooltip="$t('org.vue.components.project-dependency-item.actions.uninstall', { target: dependency.id })"
        @click="$emit('uninstall')"
      />
    </div>
  </div>
</template>

<script>
import DEPENDENCY_DETAILS from '@/graphql/dependency/dependencyDetails.gql'
import DEPENDENCY_UPDATE from '@/graphql/dependency/dependencyUpdate.gql'

export default {
  props: {
    dependency: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      updating: false,
      visible: false,
      image: null
    }
  },

  apollo: {
    dependencyDetails: {
      query: DEPENDENCY_DETAILS,
      variables () {
        return {
          id: this.dependency.id
        }
      },
      skip () {
        return !this.visible
      }
    }
  },

  methods: {
    async updateDependency () {
      this.updating = true
      try {
        this.$apollo.mutate({
          mutation: DEPENDENCY_UPDATE,
          variables: {
            input: {
              id: this.dependency.id
            }
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
        this.image = `https://avatars.dicebear.com/v2/identicon/${this.dependency.id.replace(/\//g, '-')}.svg`
        this.visible = isVisible
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-dependency-item
  padding $padding-item
  cursor default
  height 44px

  .content
    h-box()
    box-center()

  .list-item-info
    flex 100% 1 1
    width 0

  .dependency-description
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
  .wanted,
  .latest
    min-width 130px
    .value
      font-family monospace
      font-size .9em

  .installed
    @media (max-width: 1130px)
      display none

  .package-description
    font-style italic
    opacity .7
    display inline-block
    max-width 300px
    ellipsis()
    position relative
    top 4px
    @media (max-width: 1080px)
      display none

  .icon-button
    &:not(:last-child)
      margin-right 6px

</style>
