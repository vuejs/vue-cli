<template>
  <div id="app">
    <!-- s -->
    <!-- fill my routers-->
     <v-app>
      <v-navigation-drawer v-model="showNav" absolute fixed floating app>
          <nav-drawer :currentView="currentView"></nav-drawer>
      </v-navigation-drawer>
      <v-content>
        <v-container>
          <router-view v-bind:hasWebGL="hasWebGL"></router-view>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>

import NavDrawer from './components/NavDrawer'
import RightContent from './components/RightContent'
import { DemoModelsDictionary } from './data/DemoModels'
import * as KerasJS from 'kerasjs-lib'

export default {
  data () {
    return {
      showNav: true,
      showInfoPanel: false,
      hasWebGL: KerasJS.GPU_SUPPORT
    }
  },
   computed: {
    currentView() {
      const path = this.$route.path
      return path.replace(/^\//, '') || 'home'
    },
    currentTitle() {
      return DemoModelsDictionary[this.currentView]
    }
  },
  name: 'app',
  components: { NavDrawer, RightContent }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
