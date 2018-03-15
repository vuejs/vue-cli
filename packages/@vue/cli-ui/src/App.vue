<template>
  <div id="app" class="app">
    <div class="content">
      <router-view/>
    </div>

    <StatusBar/>
  </div>
</template>

<script>
import StatusBar from './components/StatusBar'

export default {
  components: {
    StatusBar
  }
}
</script>

<style lang="stylus">
@import "~@vue/ui/dist/vue-ui.css"
@import "~@/style/main"
</style>

<style lang="stylus" scoped>
@import "~@/style/imports"

.app
  display grid
  grid-template-columns 1fr
  grid-template-rows 1fr auto
  grid-template-areas "content" "status"

.content
  grid-area content
  overflow hidden

.status-bar
  grid-area status
</style>
