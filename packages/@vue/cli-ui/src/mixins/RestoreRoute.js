export default function () {
  let lastRoute

  // @vue/component
  return {
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
    }
  }
}
