
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
        const { name, params, query } = lastRoute
        next({ name, params, query })
        lastRoute = null
      } else {
        next()
      }
    },

    beforeRouteLeave (to, from, next) {
      lastRoute = from
      next()
    },

    methods: {
      replaceBaseRoute () {
        if (baseRoute) this.$router.replace(baseRoute)
      }
    }
  }
}
