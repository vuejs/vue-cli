<template>
  <Widget
    :widget="widget"
    :shell-style="{
      left: `${this.dashboard.left + 8}px`,
      top: `${this.dashboard.top + 8}px`,
      width: `${this.dashboard.width}px`,
      height: `${this.dashboard.height}px`,
      transformOrigin: `${this.shellOrigin.x}px ${this.shellOrigin.y}px`
    }"
    class="widget-details-view"
    details
    @close="close()"
  />
</template>

<script>
export default {
  inject: [
    'dashboard'
  ],

  props: {
    widget: {
      type: Object,
      required: true
    },

    shellOrigin: {
      type: Object,
      required: true
    }
  },

  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus" scoped>
.widget-details-view
  /deep/ .shell
    position fixed
    z-index 50
</style>
