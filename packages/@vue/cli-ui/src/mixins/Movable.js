export default function movable ({
  gridSize,
  field,
  zoom
}) {
  // @vue/component
  return {
    data () {
      return {
        moveState: null
      }
    },

    beforeDestroy () {
      this.removeMoveListeners()
    },

    methods: {
      removeMoveListeners () {
        window.removeEventListener('mousemove', this.onMoveUpdate)
        window.removeEventListener('mouseup', this.onMoveEnd)
      },

      updateMoveState (e) {
        const mouseDeltaX = e.clientX - this.$_initalMousePosition.x
        const mouseDeltaY = e.clientY - this.$_initalMousePosition.y
        const pxX = this[field].x * gridSize + mouseDeltaX / zoom
        const pxY = this[field].y * gridSize + mouseDeltaY / zoom
        let x = Math.round(pxX / gridSize)
        let y = Math.round(pxY / gridSize)
        if (x < 0) x = 0
        if (y < 0) y = 0
        this.moveState = {
          pxX,
          pxY,
          x,
          y
        }
      },

      onMoveStart (e) {
        this.$_initalMousePosition = {
          x: e.clientX,
          y: e.clientY
        }
        this.updateMoveState(e)
        window.addEventListener('mousemove', this.onMoveUpdate)
        window.addEventListener('mouseup', this.onMoveEnd)
      },

      onMoveUpdate (e) {
        this.updateMoveState(e)
      },

      async onMoveEnd (e) {
        this.updateMoveState(e)
        this.removeMoveListeners()
        if (this.onMoved) await this.onMoved()
        this.moveState = null
      }
    }
  }
}
