import { isSameRoute } from '../util/route'

import PROJECT_CURRENT from '../graphql/projectCurrent.gql'

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

    methods: {
      replaceBaseRoute () {
        if (baseRoute && !isSameRoute(this.$route, baseRoute, false)) {
          this.$router.replace(baseRoute)
        }
      }
    }
  }
}
