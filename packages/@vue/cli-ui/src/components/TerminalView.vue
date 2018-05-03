<template>
  <div class="terminal-view">
    <div v-if="toolbar" class="pane-toolbar">
      <VueIcon
        icon="dvr"
      />
      <div class="title">{{ title }}</div>
      <VueButton
        class="icon-button"
        icon-left="delete_forever"
        v-tooltip="$t('components.terminal-view.buttons.clear')"
        @click="clear(); $emit('clear')"
      />
      <VueIcon
        icon="lens"
        class="separator"
      />
      <VueButton
        class="icon-button"
        icon-left="subdirectory_arrow_left"
        v-tooltip="$t('components.terminal-view.buttons.scroll')"
        @click="scrollToBottom()"
      />
    </div>

    <div class="view">
      <div ref="render" class="xterm-render"></div>
    </div>

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
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
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
    },

    toolbar: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: null
    },

    openLinks: {
      type: Boolean,
      default: false
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

    if (this.autoSize) {
      this.$nextTick(this.fit)
    }
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

    setContent (value, ln = true) {
      if (value.indexOf('\n') !== -1) {
        value.split('\n').forEach(
          t => this.setContent(t)
        )
        return
      }
      if (typeof value === 'string') {
        this.$_terminal[ln ? 'writeln' : 'write'](value)
      } else {
        this.$_terminal.writeln('')
      }
    },

    addLog (log) {
      this.setContent(log.text, log.type === 'stdout')
    },

    clear () {
      this.$_terminal.clear()
    },

    scrollToBottom () {
      this.$_terminal.scrollToBottom()
    },

    handleLink (event, uri) {
      if (this.openLinks) {
        window.open(uri, '_blank')
      }
      this.$emit('link', uri)
    },

    async fit () {
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
  v-box()
  align-items stretch
  background $vue-ui-color-light-neutral

  .view
    flex 100% 1 1
    height 0
    position relative
    padding-left $padding-item

  .xterm-render
    width 100%
    height 100%
    >>> .xterm
      .xterm-cursor-layer
        display none
</style>
