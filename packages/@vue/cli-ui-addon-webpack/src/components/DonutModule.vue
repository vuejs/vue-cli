<template>
  <g
    v-if="visible"
    class="donut-module"
    :class="{
      hover
    }"
    :transform="`translate(-${size / 2}, -${size / 2}) rotate(${rotation}, ${size / 2}, ${size / 2})`"
  >
    <g class="container">
      <path
        ref="path"
        class="progress"
        :d="`M ${size / 2}, ${size / 2}
        m 0, -${size / 2}
        a ${size / 2},${size / 2} 0 1 1 0,${size}
        a ${size / 2},${size / 2} 0 1 1 0,-${size}`"
        :stroke-dasharray="`${finalDasharray - 0.25} ${finalDasharray - 0.25}`"
        :stroke-dashoffset="finalDashoffset"
        :stroke="stroke"
      />
    </g>

    <g
      v-if="depth + 1 < colors.length"
      class="children"
      :transform="`translate(${size / 2}, ${size / 2})`"
    >
      <DonutModule
        v-for="m of module.children"
        v-if="isVisible(getRatio(m, ratio))"
        :key="m.id"
        :module="m"
        :depth="depth + 1"
        :parent-module="module"
        :parent-ratio="ratio"
        :colors="colors"
      />
    </g>
  </g>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DonutModule',

  inject: [
    'WebpackAnalyzer'
  ],

  props: {
    module: {
      type: Object,
      required: true
    },

    parentModule: {
      type: Object,
      default: undefined
    },

    depth: {
      type: Number,
      required: true
    },

    parentRatio: {
      type: Number,
      required: true
    },

    colors: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      dasharray: 0
    }
  },

  computed: {
    ...mapGetters([
      'sizeField'
    ]),

    finalDasharray () {
      return (this.finalDashoffset === 0 ||
        this.finalDashoffset === this.dasharray * 2)
        ? 0 : this.dasharray
    },

    finalDashoffset () {
      if (this.ratio < 0) {
        return -this.dasharray * this.ratio + this.dasharray
      } else {
        return (1 - this.ratio) * this.dasharray
      }
    },

    ratio () {
      return this.getRatio(this.module, this.parentRatio)
    },

    rotation () {
      return this.module.previousSize[this.sizeField] / this.parentModule.size[this.sizeField] * this.parentRatio * 360
    },

    size () {
      return this.depth * 6.5 + 40
    },

    stroke () {
      return this.colors[this.depth]
    },

    visible () {
      return this.isVisible(this.ratio)
    },

    hover () {
      return this.WebpackAnalyzer.hoverModule === this.module
    }
  },

  mounted () {
    if (this.visible) {
      this.dasharray = this.$refs.path.getTotalLength()
    }
  },

  methods: {
    getRatio (module, parentRatio) {
      return module.size[this.sizeField] / this.parentModule.size[this.sizeField] * parentRatio
    },

    isVisible (ratio) {
      return ratio > 0.0025
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

path
  fill none
  stroke-width 3

.hover > .container
  path
    stroke $vue-ui-color-warning
</style>
