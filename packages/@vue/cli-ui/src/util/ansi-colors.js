import AU from 'ansi_up'

const ansiUp = new AU()
ansiUp.use_classes = true
ansiUp.escape_for_html = false

export default {
  install (Vue) {
    Vue.prototype.ansiColors = text => ansiUp.ansi_to_html(text)
  }
}
