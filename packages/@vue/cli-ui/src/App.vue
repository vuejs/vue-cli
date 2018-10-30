<template>
  <div id="app" class="app">
    <ConnectionStatus v-if="ready" />
    <div v-if="ready" class="content">
      <router-view/>
    </div>
    <VueLoadingIndicator v-else class="app-init-loading overlay big accent"/>

    <StatusBar/>
    <ClientAddonLoader/>
    <LocaleLoader/>
  </div>
</template>

<script>
import i18n from './i18n'

import ROUTE_REQUESTED from '@/graphql/app/routeRequested.gql'

export default {
  metaInfo: {
    titleTemplate: chunk => chunk ? `[Beta] ${chunk} - Vue CLI` : '[Beta] Vue CLI'
  },

  computed: {
    ready () {
      return Object.keys(i18n.getLocaleMessage('en')).length
    }
  },

  apollo: {
    $subscribe: {
      routeRequested: {
        query: ROUTE_REQUESTED,
        result ({ data }) {
          this.$router.push(data.routeRequested)
        }
      }
    }
  }
}
</script>

<style lang="stylus">
@import "~@vue/ui/dist/vue-ui.css"
@import "~@/style/main"
</style>

<style lang="stylus" scoped>
.app
  display flex
  flex-direction column

.connection-status,
.status-bar
  flex auto 0 0

.content
  flex auto 1 1
  height 100%
  overflow hidden

.app-init-loading
  z-index 100000
</style>
