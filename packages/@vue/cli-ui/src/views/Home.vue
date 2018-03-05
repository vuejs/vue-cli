<template>
  <div class="home page">
    <ProjectNav/>

    <div class="content">
      <router-view/>
    </div>

    <StatusBar/>
  </div>
</template>

<script>
import ProjectNav from '../components/ProjectNav'
import StatusBar from '../components/StatusBar'

export default {
  name: 'home',

  components: {
    ProjectNav,
    StatusBar
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.home
  display grid
  grid-template-columns 46px 1fr
  grid-template-rows auto 28px
  grid-template-areas "side-left content" "footer footer"

.project-nav
  grid-area side-left

.content
  grid-area content

.status-bar
  grid-area footer
</style>
