import AU from 'ansi_up'

const ansiUp = new AU()
ansiUp.use_classes = true

export default {
  install (Vue) {
    Vue.prototype.ansiColors = text => ansiUp.ansi_to_html(text)
  }
}
