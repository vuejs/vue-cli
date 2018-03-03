function toShortId (id) {
  id.replace('@vue/cli-plugin-', '').replace('vue-cli-plugin-', '')
}

module.exports = {
  toShortId
}
