<template>
  <div class="vue-webpack-analyzer">
    <div class="pane-toolbar">
      <VueIcon icon="donut_large"/>
      <div class="title">{{ $t('org.vue.vue-webpack.analyzer.title') }}</div>

      <VueSwitch
        v-if="mode !== 'serve' && modernMode"
        v-model="showModernBuild"
      >
        {{ $t('org.vue.vue-webpack.modern-mode') }}
      </VueSwitch>

      <template v-if="currentTree">
        <VueButton
          icon-left="arrow_upward"
          :label="$t('org.vue.vue-webpack.analyzer.go-up')"
          :disabled="currentTree === rootTree"
          @click="goToParent()"
        />
        <VueButton
          icon-left="home"
          :label="$t('org.vue.vue-webpack.analyzer.go-home')"
          :disabled="currentTree === rootTree"
          @click="goToHome()"
        />
        <VueIcon
          icon="lens"
          class="separator"
        />
      </template>

      <VueSelect
        v-model="selectedChunk"
        :disabled="Object.keys(modulesTrees).length === 0"
      >
        <VueSelectButton
          v-for="(chunk, key) of modulesTrees"
          :key="key"
          :value="key"
          :label="`${$t('org.vue.vue-webpack.analyzer.chunk')} ${getChunkName(key)}`"
        />
      </VueSelect>

      <VueSelect v-model="sizeField">
        <VueSelectButton value="stats" :label="`${$t('org.vue.vue-webpack.sizes.stats')}`"/>
        <VueSelectButton value="parsed" :label="`${$t('org.vue.vue-webpack.sizes.parsed')}`"/>
        <VueSelectButton value="gzip" :label="`${$t('org.vue.vue-webpack.sizes.gzip')}`"/>
      </VueSelect>

      <VueButton
        class="icon-button"
        icon-left="help"
        v-tooltip="$t('org.vue.vue-webpack.sizes.help')"
      />
    </div>

    <div class="content">
      <template v-if="currentTree">
        <svg
          ref="svg"
          :key="sizeField"
          class="donut"
          :class="{
            hover: hoverModule
          }"
          viewBox="0 0 80 80"
          @mousemove="onMouseMove"
          @mouseout="onMouseOut"
          @click="onDonutClick"
        >
          <g transform="translate(40, 40)">
            <DonutModule
              v-for="(module, index) of currentTree.children"
              :key="module.id"
              :module="module"
              :parent-module="currentTree"
              :colors="getColors(index)"
              :depth="0"
              :parent-ratio="1"
            />
          </g>
        </svg>
      </template>

      <div v-if="describedModule" class="described-module">
        <div class="wrapper">
          <div class="path" v-html="modulePath"/>
          <div
            class="stats size"
            :class="{ selected: sizeField === 'stats' }"
          >
            {{ $t('org.vue.vue-webpack.sizes.stats') }}: {{ describedModule.size.stats | size('B')}}
          </div>
          <div
            class="parsed size"
            :class="{ selected: sizeField === 'parsed' }"
          >
            {{ $t('org.vue.vue-webpack.sizes.parsed') }}: {{ describedModule.size.parsed | size('B')}}
          </div>
          <div
            class="gzip size"
            :class="{ selected: sizeField === 'gzip' }"
          >
            {{ $t('org.vue.vue-webpack.sizes.gzip') }}: {{ describedModule.size.gzip | size('B')}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Dashboard from '../mixins/Dashboard'
import colors from '../util/colors'
import { size } from '../filters'

import DonutModule from './DonutModule.vue'

export default {
  clientState: true,

  mixins: [
    Dashboard
  ],

  filters: {
    size
  },

  components: {
    DonutModule
  },

  provide () {
    return {
      WebpackAnalyzer: this.injection
    }
  },

  data () {
    return {
      selectedChunk: null,
      injection: {
        hoverModule: null
      },
      currentTree: null,
      currentParent: null
    }
  },

  computed: {
    ...mapGetters([
      'modulesTrees',
      'chunks'
    ]),

    hoverModule: {
      get () { return this.injection.hoverModule },
      set (value) { this.injection.hoverModule = value }
    },

    describedModule () {
      return this.hoverModule || this.currentTree
    },

    modulePath () {
      if (!this.describedModule) return
      let path = `<b>${this.describedModule.id}</b>`
      let module = this.describedModule
      while (module.parent && module !== this.currentTree) {
        module = module.parent
        path = `${module.id} / ${path}`
      }
      return path
    },

    rootTree () {
      return this.modulesTrees && this.modulesTrees[this.selectedChunk]
    }
  },

  watch: {
    modulesTrees: {
      handler (value) {
        if (value) {
          const keys = Object.keys(value)
          if (keys.length) {
            if (!this.selectedChunk || !keys.includes(this.selectedChunk)) {
              if (keys.length) {
                this.selectedChunk = keys[0]
              }
            }
            this.goToHome()
            return
          }
        }

        // Clear
        this.currentTree = null
        this.selectedChunk = null
      },
      immediate: true
    },

    selectedChunk: {
      handler: 'goToHome',
      immediate: true
    }
  },

  methods: {
    syncMode (mode) {
      Dashboard.methods.syncMode.call(this, mode)
      this.$watchSharedData(`org.vue.webpack.${mode}-stats-analyzer`, value => {
        this.$store.commit('analyzer', {
          mode,
          value
        })
      })
    },

    getColors (index) {
      const list = colors[this.darkMode ? 'dark' : 'light']
      return list[index % list.length]
    },

    getChunk (id) {
      return this.chunks.find(
        c => c.id.toString() === id.toString()
      )
    },

    getChunkName (id) {
      const chunk = this.getChunk(id)
      if (chunk) {
        if (chunk.names && chunk.names.length) {
          return `${chunk.names[0]} (${id})`
        }
        if (chunk.files && chunk.files.length) {
          return `${chunk.files[0]} (${id})`
        }
      }
      return id
    },

    onMouseMove (event) {
      const svg = this.$refs.svg
      const { clientX, clientY } = event
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      let { x, y } = pt.matrixTransform(svg.getScreenCTM().inverse())
      x -= 40
      y -= 40

      let angle = (Math.atan2(y, x) / Math.PI * 180 + 90)
      // Modulo 360
      angle = ((angle % 360) + 360) % 360
      const distance = Math.sqrt(x * x + y * y)
      const depth = Math.floor(((distance + 1.5) * 2 - 40) / 6.5)

      if (depth < 0) {
        this.hoverModule = null
        return
      }

      // Walk the tree to find the hovered module
      const sizeField = this.sizeField
      let tree = this.currentTree
      let rotation = angle
      let ratio = rotation / 360
      // We use a target module size
      let targetSize = tree.size[sizeField] * ratio
      let parentRatio = 1
      for (let d = 0; d <= depth; d++) {
        let found = false
        for (const child of tree.children) {
          const previousSize = child.previousSize[sizeField]
          const size = child.size[sizeField]
          if (previousSize + size >= targetSize) {
            // Select child
            const parentSize = tree.size[sizeField]
            const childRatio = size / parentSize * parentRatio
            const childRotation = previousSize / parentSize * parentRatio * 360
            // We update rotation to become relative to selected child
            rotation -= childRotation
            // We calculate a new target module size relative to selected child
            ratio = rotation / 360 / childRatio
            targetSize = size * ratio
            // New base ratio for deeper children
            parentRatio = childRatio
            // Go deeper
            tree = child
            found = true
            break
          }
        }
        if (!found) {
          tree = null
          break
        }
      }
      this.hoverModule = tree
    },

    onMouseOut (event) {
      this.hoverModule = null
    },

    onDonutClick () {
      if (this.hoverModule && this.hoverModule.children.length) {
        this.currentParent = this.currentTree
        this.currentTree = this.hoverModule
        this.hoverModule = null
      }
    },

    goToParent () {
      if (this.currentParent) {
        this.currentTree = this.currentParent
      }
    },

    goToHome () {
      this.currentTree = this.rootTree
      this.currentParent = null
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.vue-webpack-analyzer
  height 100%
  display grid
  grid-template-columns auto
  grid-template-rows auto 1fr
  grid-gap $padding-item
  overflow-y hidden

  .pane-toolbar,
  .described-module .wrapper
    padding $padding-item
    background $vue-ui-color-light-neutral
    border-radius $br
    .vue-ui-dark-mode &
      background $vue-ui-color-dark

  .content
    display flex
    flex-direction column
    position relative

  .donut
    width 100%
    flex auto 1 1
    height 0
    &.hover
      cursor pointer

  .described-module
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    pointer-events none
    v-box()
    box-center()

    .wrapper
      max-width 170px
      overflow hidden

      .size
        &:not(.selected)
          opacity .5
</style>
