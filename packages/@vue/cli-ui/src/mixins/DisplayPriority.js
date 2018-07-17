export default function (count = 1) {
  // @vue/component
  return {
    data () {
      return {
        displayPriority: 0
      }
    },

    mounted () {
      this.runDislayPriority()
    },

    methods: {
      runDislayPriority () {
        const step = () => {
          requestAnimationFrame(() => {
            this.displayPriority++
            if (this.displayPriority < count) {
              step()
            }
          })
        }
        step()
      }
    }
  }
}
