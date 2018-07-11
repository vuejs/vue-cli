export let responsive

export default {
  install (Vue, options) {
    const finalOptions = Object.assign({}, {
      computed: {}
    }, options)

    responsive = new Vue({
      data () {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      computed: finalOptions.computed
    })

    Object.defineProperty(Vue.prototype, '$responsive', {
      get: () => responsive
    })

    window.addEventListener('resize', () => {
      responsive.width = window.innerWidth
      responsive.height = window.innerHeight
    })
  }
}
