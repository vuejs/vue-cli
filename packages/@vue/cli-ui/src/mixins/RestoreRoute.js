import { isSameRoute } from '../util/route'

import PROJECT_CURRENT from '@/graphql/project/projectCurrent.gql'

export default function ({
  baseRoute = null
} = {}) {
  let lastRoute

  // @vue/component
  return {
    apollo: {
      projectCurrent: PROJECT_CURRENT
    },

    watch: {
      projectCurrent (value) {
        if (!this.$_restoreRouteReady) return
        this.replaceBaseRoute()
      }
    },

    bus: {
      quickOpenProject (project) {
        this.replaceBaseRoute()
      }
    },

    beforeRouteEnter (to, from, next) {
      if (lastRoute) {
        if (!to.query) {
          console.log('lastRoute', lastRoute)
          const { name, params, query } = lastRoute
          next({ name, params, query })
          return
        }
        lastRoute = null
      }
      next()
    },

    beforeRouteLeave (to, from, next) {
      lastRoute = from
      next()
    },

    mounted () {
      this.$nextTick(() => {
        this.$_restoreRouteReady = true
      })
    },

    methods: {
      replaceBaseRoute () {
        if (baseRoute && !isSameRoute(this.$route, baseRoute, false)) {
          console.log('replaceBaseRoute')
          this.$router.replace(baseRoute)
        }
      }
    }
  }
}
