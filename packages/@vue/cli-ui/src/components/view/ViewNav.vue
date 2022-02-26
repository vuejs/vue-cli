<template>
  <div
    class="project-nav"
    :class="{
      wide: $responsive.wide
    }"
  >
    <div class="header">
      <ProjectQuickDropdown/>
    </div>

    <div class="content">
      <VueGroup
        v-model="currentViewName"
        class="vertical small-indicator left-indicator primary"
        indicator
      >
        <template v-for="view of views">
          <ViewNavButton
            v-if="hasProjectType(view)"
            :key="view.id"
            :view="view"
          />
        </template>
      </VueGroup>

      <ViewNavMore/>
    </div>
  </div>
</template>

<script>
import { isSameRoute, isIncludedRoute } from '@/util/route'

import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql'
import VIEWS from '@/graphql/view/views.gql'
import VIEW_ADDED from '@/graphql/view/viewAdded.gql'
import VIEW_REMOVED from '@/graphql/view/viewRemoved.gql'
import VIEW_CHANGED from '@/graphql/view/viewChanged.gql'
import VIEW_OPEN from '@/graphql/view/viewOpen.gql'

export default {
  data () {
    return {
      views: []
    }
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT,

    views: {
      query: VIEWS,
      subscribeToMore: [
        {
          document: VIEW_ADDED,
          updateQuery: (previousResult, { subscriptionData }) => {
            const view = subscriptionData.data.viewAdded
            if (!previousResult.views) {
              return {
                views: [view]
              }
            }
            if (previousResult.views.find(r => r.id === view.id)) return previousResult
            return {
              views: [
                ...previousResult.views,
                view
              ]
            }
          }
        },
        {
          document: VIEW_REMOVED,
          updateQuery: (previousResult, { subscriptionData }) => {
            if (!previousResult.views) return { views: [] }
            const index = previousResult.views.findIndex(r => r.id === subscriptionData.data.viewRemoved.id)
            if (index === -1) return previousResult
            const views = previousResult.views.slice()
            views.splice(index, 1)
            return {
              views
            }
          }
        },
        {
          document: VIEW_CHANGED,
          updateQuery: (previousResult, { subscriptionData }) => {
            const view = subscriptionData.data.viewChanged
            if (!previousResult.views) {
              return {
                views: [view]
              }
            }
            const index = previousResult.views.findIndex(r => r.id === view.id)
            if (index === -1) return previousResult
            const views = previousResult.views.slice()
            views.splice(index, 1, view)
            return {
              views
            }
          }
        }
      ]
    }
  },

  computed: {
    currentView () {
      const currentRoute = this.$route
      return this.views.find(
        item => isIncludedRoute(currentRoute, this.$router.resolve({ name: item.name }).route)
      )
    },

    currentViewName: {
      get () {
        const view = this.currentView
        return view && view.name
      },
      set (name) {
        if (!isSameRoute(this.$route, this.$router.resolve({ name }).route)) {
          this.$router.push({ name })
        }
      }
    }
  },

  watch: {
    currentView: {
      handler (value, oldValue) {
        if (!value) return
        if (oldValue && value.id === oldValue.id) return

        this.checkProjectType()
        this.$apollo.mutate({
          mutation: VIEW_OPEN,
          variables: {
            id: value.id
          }
        })
      },
      immediate: true
    },

    projectCurrent: {
      handler: 'checkProjectType',
      immediate: true
    }
  },

  methods: {
    hasProjectType (view) {
      return (!view.projectTypes && this.projectCurrent.type === 'vue') ||
        (view.projectTypes && view.projectTypes.includes(this.projectCurrent.type))
    },

    checkProjectType () {
      if (!this.currentView) return

      if (!this.hasProjectType(this.currentView)) {
        const view = this.views.find(v => this.hasProjectType(v))
        if (view) {
          this.currentViewName = view.name
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-nav
  background $vue-ui-color-light
  box-shadow 2px 0 10px rgba(black, .1)
  position relative
  z-index 2
  v-box()
  .vue-ui-dark-mode &
    background $vue-ui-color-darker

  .header
    padding $padding-item
    display flex
    .project-quick-dropdown
      flex 1

  .content
    flex 1
    v-box()
    height 100%
    padding 8px 0
    box-sizing border-box

    .vue-ui-group
      flex auto 1 1
      height 0
      overflow hidden

    >>> .indicator
      justify-content flex-start
      margin-left 4px

      .content
        width 6px
        height @width !important
        border-radius 50%
        border none !important
        background $vue-ui-color-primary

    >>> .vue-ui-dropdown
      display block !important

    >>> .vue-ui-button
      border-radius 0
      padding-left 0
      padding-right @padding-left
      h-box()
      box-center()
      width 100%
      &.selected
        button-colors($vue-ui-color-primary, transparent)

  &.wide
    .content
      >>> .vue-ui-button
        justify-content flex-start
        padding-left $padding-item
        padding-right @padding-left
        > .content
          width 100%
          text-align left
          > .default-slot
            flex auto 1 1
            width 0
            ellipsis()
            padding 4px 0
</style>
