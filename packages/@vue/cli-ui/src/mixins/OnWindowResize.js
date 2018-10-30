export default function () {
  // @vue/component
  return {
    mounted () {
      window.addEventListener('resize', this.onWindowResize)
      this.onWindowResize()
    },

    beforeDestroy () {
      window.removeEventListener('resize', this.onWindowResize)
    }
  }
}
