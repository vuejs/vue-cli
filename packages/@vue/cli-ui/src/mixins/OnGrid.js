export default function ({
  gridSize,
  field
}) {
  // @vue/component
  return {
    computed: {
      mainStyle () {
        if (this.moveState) {
          return {
            ...this.getPositionStyle(this.moveState.pxX, this.moveState.pxY),
            ...this.getSizeStyle()
          }
        }
        if (this.resizeState) {
          return {
            ...this.getPositionStyle(this.resizeState.pxX, this.resizeState.pxY),
            ...this.getSizeStyle(this.resizeState.pxWidth, this.resizeState.pxHeight)
          }
        }
        return {
          ...this.getPositionStyle(gridSize * this[field].x, gridSize * this[field].y),
          ...this.getSizeStyle()
        }
      },

      moveGhostStyle () {
        return {
          ...this.getPositionStyle(gridSize * this.moveState.x, gridSize * this.moveState.y),
          ...this.getSizeStyle()
        }
      },

      resizeGhostStyle () {
        return {
          ...this.getPositionStyle(gridSize * this.resizeState.x, gridSize * this.resizeState.y),
          ...this.getSizeStyle(gridSize * this.resizeState.width, gridSize * this.resizeState.height)
        }
      }
    },

    methods: {
      getPositionStyle (x, y) {
        return {
          left: `${x}px`,
          top: `${y}px`
        }
      },

      getSizeStyle (width, height) {
        return {
          width: `${width || gridSize * this[field].width}px`,
          height: `${height || gridSize * this[field].height}px`
        }
      }
    }
  }
}
