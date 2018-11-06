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
        if (!to.params || !Object.keys(to.params).length) {
          const { name, params, query } = lastRoute
          next({ name, params, query })
          return
        }
        lastRoute = null
      }
      next()
    },

    beforeRouteLeave (to, from, next) {
      if (from.params && Object.keys(from.params).length) {
        lastRoute = from
      }
      next()
    },

    mounted () {
      setTimeout(() => {
        this.$_restoreRouteReady = true
      }, 100)
    },

    methods: {
      replaceBaseRoute () {
        if (baseRoute && !isSameRoute(this.$route, baseRoute, false)) {
          this.$router.replace(baseRoute)
        }
      }
    }
  }
}
