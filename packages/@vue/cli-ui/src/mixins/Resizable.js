export default function ({
  gridSize,
  field,
  zoom
}) {
  // @vue/component
  return {
    data () {
      return {
        resizeState: null
      }
    },

    computed: {
      showResizeHandle () {
        return this.isSelected && !this.moveState &&
          this.canBeResized
      },

      canBeResized () {
        const { definition } = this[field]
        return definition.minWidth !== definition.maxWidth ||
          definition.minHeight !== definition.maxHeight
      }
    },

    created () {
      this.resizeHandles = [
        'top-left',
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left'
      ]
    },

    beforeDestroy () {
      this.removeResizeListeners()
    },

    methods: {
      removeResizeListeners () {
        window.removeEventListener('mousemove', this.onResizeMove)
        window.removeEventListener('mouseup', this.onResizeEnd)
      },

      updateResizeState (e) {
        const mouseDeltaX = (e.clientX - this.$_initalMousePosition.x) / zoom
        const mouseDeltaY = (e.clientY - this.$_initalMousePosition.y) / zoom
        const handle = this.$_resizeHandle
        let dX = 0
        let dY = 0
        let dWidth = 0
        let dHeight = 0
        // TODO
        if (handle.includes('right')) {
          dWidth = mouseDeltaX
        }
        if (handle.includes('bottom')) {
          dHeight = mouseDeltaY
        }
        let gridDX = Math.round(dX / gridSize)
        let gridDY = Math.round(dY / gridSize)
        let gridDWidth = Math.round(dWidth / gridSize)
        let gridDHeight = Math.round(dHeight / gridSize)
        if (this[field].width + gridDWidth < this[field].definition.minWidth) {
          gridDWidth = this[field].definition.minWidth - this[field].width
        }
        if (this[field].width + gridDWidth > this[field].definition.maxWidth) {
          gridDWidth = this[field].definition.maxWidth - this[field].width
        }
        if (this[field].height + gridDHeight < this[field].definition.minHeight) {
          gridDHeight = this[field].definition.minHeight - this[field].height
        }
        if (this[field].height + gridDHeight > this[field].definition.maxHeight) {
          gridDHeight = this[field].definition.maxHeight - this[field].height
        }
        this.resizeState = {
          x: this[field].x + gridDX,
          y: this[field].y + gridDY,
          width: this[field].width + gridDWidth,
          height: this[field].height + gridDHeight,
          pxX: this[field].x * gridSize + dX,
          pxY: this[field].y * gridSize + dY,
          pxWidth: this[field].width * gridSize + dWidth,
          pxHeight: this[field].height * gridSize + dHeight
        }
      },

      onResizeStart (e, handle) {
        this.$_initalMousePosition = {
          x: e.clientX,
          y: e.clientY
        }
        this.$_resizeHandle = handle
        this.updateResizeState(e)
        window.addEventListener('mousemove', this.onResizeMove)
        window.addEventListener('mouseup', this.onResizeEnd)
      },

      onResizeMove (e) {
        this.updateResizeState(e)
      },

      async onResizeEnd (e) {
        this.updateResizeState(e)
        this.removeResizeListeners()
        if (this.onResized) await this.onResized()
        this.resizeState = null
      }
    }
  }
}
