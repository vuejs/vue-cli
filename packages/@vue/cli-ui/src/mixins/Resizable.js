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
        const target = this[field]
        const mouseDeltaX = (e.clientX - this.$_initalMousePosition.x) / zoom
        const mouseDeltaY = (e.clientY - this.$_initalMousePosition.y) / zoom
        const handle = this.$_resizeHandle
        let dX = 0
        let dY = 0
        let dWidth = 0
        let dHeight = 0
        // Handles
        if (handle.includes('left')) {
          dX = mouseDeltaX
          dWidth = -mouseDeltaX
        } else if (handle.includes('right')) {
          dWidth = mouseDeltaX
        }
        if (handle.includes('top')) {
          dY = mouseDeltaY
          dHeight = -mouseDeltaY
        } else if (handle.includes('bottom')) {
          dHeight = mouseDeltaY
        }
        // On-grid diffs
        let gridDX = Math.round(dX / gridSize)
        let gridDY = Math.round(dY / gridSize)
        let gridDWidth = Math.round(dWidth / gridSize)
        let gridDHeight = Math.round(dHeight / gridSize)
        // Bounds
        if (target.width + gridDWidth < target.definition.minWidth) {
          gridDWidth = target.definition.minWidth - target.width
          gridDX = target.width - target.definition.minWidth
        }
        if (target.width + gridDWidth > target.definition.maxWidth) {
          gridDWidth = target.definition.maxWidth - target.width
          gridDX = target.width - target.definition.maxWidth
        }
        if (target.height + gridDHeight < target.definition.minHeight) {
          gridDHeight = target.definition.minHeight - target.height
          gridDY = target.height - target.definition.minHeight
        }
        if (target.height + gridDHeight > target.definition.maxHeight) {
          gridDHeight = target.definition.maxHeight - target.height
          gridDY = target.height - target.definition.maxHeight
        }
        // Temp. applied state
        this.resizeState = {
          x: target.x + gridDX,
          y: target.y + gridDY,
          width: target.width + gridDWidth,
          height: target.height + gridDHeight,
          pxX: target.x * gridSize + dX,
          pxY: target.y * gridSize + dY,
          pxWidth: target.width * gridSize + dWidth,
          pxHeight: target.height * gridSize + dHeight
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
