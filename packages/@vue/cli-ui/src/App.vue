<template>
  <div id="app" class="app">
    <ConnectionStatus v-if="ready" />
    <div v-if="ready" class="content">
      <router-view/>
    </div>
    <VueLoadingIndicator v-else class="overlay big accent"/>

    <StatusBar/>
    <ClientAddonLoader/>
    <LocaleLoader/>
  </div>
</template>

<script>
import i18n from './i18n'

export default {
  metaInfo: {
    titleTemplate: chunk => chunk ? `[Beta] ${chunk} - Vue CLI` : '[Beta] Vue CLI'
  },

  computed: {
    ready () {
      return Object.keys(i18n.getLocaleMessage('en')).length
    }
  }
}
</script>

<style lang="stylus">
@import "~@vue/ui/dist/vue-ui.css"
@import "~file-icons-js/css/style.css"
@import "~@/style/main"
</style>

<style lang="stylus" scoped>
@import "~@/style/imports"

.app
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr auto
  grid-template-areas "connection" "content" "status"

.connection-status
  grid-area connection

.content
  grid-area content
  overflow hidden

.status-bar
  grid-area status
</style>
