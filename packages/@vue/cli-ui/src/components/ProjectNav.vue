<template>
  <div class="project-nav">
    <div class="content">
      <VueGroup
        v-model="currentRoute"
        class="vertical small-indicator left-indicator primary"
        indicator
      >
        <ProjectNavButton
          v-for="route of routes"
          :key="route.id"
          :route="route"
        />
      </VueGroup>

      <ProjectNavMore/>
    </div>
  </div>
</template>

<script>
import { isSameRoute, isIncludedRoute } from '../util/route'

import ROUTES from '../graphql/routes.gql'
import ROUTE_ADDED from '../graphql/routeAdded.gql'
import ROUTE_REMOVED from '../graphql/routeRemoved.gql'
import ROUTE_CHANGED from '../graphql/routeChanged.gql'

export default {
  data () {
    return {
      routes: []
    }
  },

  apollo: {
    routes: {
      query: ROUTES,
      fetchPolicy: 'cache-and-network',
      subscribeToMore: [
        {
          document: ROUTE_ADDED,
          updateQuery: (previousResult, { subscriptionData }) => {
            const route = subscriptionData.data.routeAdded
            if (previousResult.routes.find(r => r.id === route.id)) return previousResult
            return {
              routes: [
                ...previousResult.routes,
                route
              ]
            }
          }
        },
        {
          document: ROUTE_REMOVED,
          updateQuery: (previousResult, { subscriptionData }) => {
            const index = previousResult.routes.findIndex(r => r.id === subscriptionData.data.routeRemoved.id)
            if (index === -1) return previousResult
            const routes = previousResult.routes.slice()
            routes.splice(index, 1)
            return {
              routes
            }
          }
        },
        {
          document: ROUTE_CHANGED,
          updateQuery: (previousResult, { subscriptionData }) => {
            const route = subscriptionData.data.routeChanged
            const index = previousResult.routes.findIndex(r => r.id === route.id)
            if (index === -1) return previousResult
            const routes = previousResult.routes.slice()
            routes.splice(index, 1, route)
            return {
              routes
            }
          }
        }
      ]
    }
  },

  computed: {
    currentRoute: {
      get () {
        const currentRoute = this.$route
        const route = this.routes.find(
          item => isIncludedRoute(currentRoute, this.$router.resolve({ name: item.name }).route)
        )
        return route && route.name
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
</style>
