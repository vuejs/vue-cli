<template>
  <div class="terminal-view card">
    <div v-if="toolbar" class="pane-toolbar">
      <VueIcon
        icon="dvr"
      />
      <div class="title">{{ title }}</div>
      <VueButton
        class="icon-button flat"
        icon-left="delete_forever"
        v-tooltip="$t('org.vue.components.terminal-view.buttons.clear')"
        @click="clear(); $emit('clear')"
      />
      <VueIcon
        icon="lens"
        class="separator"
      />
      <VueButton
        class="icon-button flat"
        icon-left="content_copy"
        v-tooltip="$t('org.vue.components.terminal-view.buttons.content-copy')"
        @click="copyContent()"
      />
      <VueButton
        class="icon-button flat"
        icon-left="subdirectory_arrow_left"
        v-tooltip="$t('org.vue.components.terminal-view.buttons.scroll')"
        @click="scrollToBottom()"
      />
    </div>

    <div class="view">
      <div ref="render" class="xterm-render"/>
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
  foreground: '#2c3e50',
  background: '#fff',
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

const darkTheme = {
  ...defaultTheme,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030'
}

export default {
  clientState: true,

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

  computed: {
    theme () {
      if (this.darkMode) {
        return darkTheme
      } else {
        return defaultTheme
      }
    }
  },

  watch: {
    cols (c) {
      this.$_terminal.resize(c, this.rows)
    },

    rows (r) {
      this.$_terminal.resize(this.cols, r)
    },

    content: 'setContent',

    darkMode (value, oldValue) {
      if (typeof oldValue === 'undefined') {
        this.initTerminal()
      } else if (this.$_terminal) {
        this.$_terminal.setOption('theme', this.theme)
      }
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
        theme: this.theme,
        ...this.options
      })
      webLinks.webLinksInit(term, this.handleLink)
      term.open(this.$refs.render)

      term.on('blur', () => this.$emit('blur'))
      term.on('focus', () => this.$emit('focus'))

      if (this.autoSize) {
        this.$nextTick(this.fit)
      }
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

    copyContent () {
      const textarea = this.$_terminal.textarea
      if (!textarea) {
        return
      }
      const textValue = textarea.value
      const emptySelection = !this.$_terminal.hasSelection()
      try {
        if (emptySelection) {
          this.$_terminal.selectAll()
        }
        var selection = this.$_terminal.getSelection()
        textarea.value = selection
        textarea.select()
        document.execCommand('copy')
      } finally {
        textarea.value = textValue
        if (emptySelection) {
          this.$_terminal.clearSelection()
        }
      }
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
.terminal-view
  v-box()
  align-items stretch

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
