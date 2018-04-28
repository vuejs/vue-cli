<template>
  <div
    class="project-nav"
    :class="{
      wide: $responsive.wide
    }"
  >
    <div class="content">
      <VueGroup
        v-model="currentView"
        class="vertical small-indicator left-indicator primary"
        indicator
      >
        <ProjectNavButton
          v-for="view of views"
          :key="view.id"
          :view="view"
        />
      </VueGroup>

      <ProjectNavMore/>
    </div>
  </div>
</template>

<script>
import { isSameRoute, isIncludedRoute } from '../util/route'

import VIEWS from '../graphql/views.gql'
import VIEW_ADDED from '../graphql/viewAdded.gql'
import VIEW_REMOVED from '../graphql/viewRemoved.gql'
import VIEW_CHANGED from '../graphql/viewChanged.gql'

export default {
  data () {
    return {
      views: []
    }
  },

  apollo: {
    views: {
      query: VIEWS,
      fetchPolicy: 'cache-and-network',
      subscribeToMore: [
        {
          document: VIEW_ADDED,
          updateQuery: (previousResult, { subscriptionData }) => {
            const view = subscriptionData.data.viewAdded
            if (!previousResult.views) {
              return {
                views: [ view ]
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
    currentView: {
      get () {
        const currentRoute = this.$route
        const view = this.views.find(
          item => isIncludedRoute(currentRoute, this.$router.resolve({ name: item.name }).route)
        )
        return view && view.name
      },
      set (name) {
        if (!isSameRoute(this.$route, this.$router.resolve({ name }).route)) {
          this.$router.push({ name })
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-nav
  background $vue-ui-color-dark

  .content
    v-box()
    height 100%
    padding 8px 0
    box-sizing border-box

    .vue-ui-group
      flex auto 1 1
      height 0
      overflow hidden

    >>> .v-popover .trigger,
    >>> .vue-ui-dropdown
      display block !important

    >>> .vue-ui-button
      button-colors(rgba($vue-ui-color-light, .7), transparent)
      border-radius 0
      padding-left 0
      padding-right @padding-left
      h-box()
      box-center()
      width 100%

      &:hover, &:active
        $bg = darken($vue-ui-color-dark, 70%)
        button-colors($vue-ui-color-light, $bg)
        &.selected
          button-colors(lighten($vue-ui-color-primary, 40%), $bg)

  &.wide
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
