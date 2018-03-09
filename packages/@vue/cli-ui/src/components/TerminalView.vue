<template>
  <div class="terminal-view">
    <div ref="render" class="xterm-render"></div>

    <resize-observer v-if="autoSize" @notify="fit"/>
  </div>
</template>

<script>
import { Terminal } from 'xterm'
import * as fit from 'xterm/dist/addons/fit/fit'
import * as webLinks from 'xterm/dist/addons/webLinks/webLinks'

Terminal.applyAddon(fit)
Terminal.applyAddon(webLinks)

const defaultTheme = {
  foreground: '#000',
  background: '#dbebec',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e06c75',
  brightRed: '#e06c75',
  green: '#A4EFA1',
  brightGreen: '#A4EFA1',
  brightYellow: '#EDDC96',
  yellow: '#EDDC96',
  magenta: '#e39ef7',
  brightMagenta: '#e39ef7',
  cyan: '#5fcbd8',
  brightBlue: '#5fcbd8',
  brightCyan: '#5fcbd8',
  blue: '#5fcbd8',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff'
}

export default {
  props: {
    cols: {
      type: Number,
      required: true
    },

    rows: {
      type: Number,
      required: true
    },

    content: {
      type: String,
      default: undefined
    },

    autoSize: {
      type: Boolean,
      default: false
    },

    options: {
      type: Object,
      default: () => ({})
    }
  },

  watch: {
    cols (c) {
      this.$_terminal.resize(c, this.rows)
    },

    rows (r) {
      this.$_terminal.resize(this.cols, r)
    },

    content: 'setContent'
  },

  mounted () {
    this.initTerminal()
  },

  beforeDestroy () {
    this.$_terminal.destroy()
  },

  methods: {
    initTerminal () {
      let term = this.$_terminal = new Terminal({
        cols: this.cols,
        rows: this.rows,
        theme: defaultTheme,
        ...this.options
      })
      webLinks.webLinksInit(term, this.handleLink)
      term.open(this.$refs.render)

      term.on('blur', () => this.$emit('blur'))
      term.on('focus', () => this.$emit('focus'))
    },

    setContent (value) {
      if (typeof value === 'string') {
        this.$_terminal.write(value)
      } else {
        this.$_terminal.writeln('')
      }
    },

    clear () {
      this.$_terminal.clear()
    },

    handleLink (event, uri) {
      this.$emit('link', uri)
    },

    async fit () {
      let parent = this.$el
      let el = this.$refs.render
      let term = this.$_terminal
      term.element.style.display = 'none'

      await this.$nextTick()

      term.fit()
      term.element.style.display = ''
      term.refresh(0, term.rows - 1)
    },

    focus () {
      this.$_terminal.focus()
    },

    blur () {
      this.$_terminal.blur()
    }
  }
}
</script>

<style lang="stylus">
@import "~xterm/dist/xterm.css"
</style>

<style lang="stylus" scoped>
@import "~@/style/imports"

.terminal-view
  position relative

.xterm-render
  width 100%
  height 100%
  >>> .xterm
    .xterm-cursor-layer
      display none
</style>
