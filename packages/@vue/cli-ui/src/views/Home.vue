<template>
  <div class="home page">
    <ProjectNav/>

    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
import ProjectNav from '../components/ProjectNav'

export default {
  name: 'home',

  components: {
    ProjectNav
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.home
  display grid
  grid-template-columns 46px 1fr
  grid-template-rows auto
  grid-template-areas "side-left content"

.project-nav
  grid-area side-left

.content
  grid-area content

</style>
