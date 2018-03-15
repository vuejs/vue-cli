<template>
  <div class="project-home page">
    <ProjectNav/>

    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectHome',
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-home
  display grid
  grid-template-columns 46px 1fr
  grid-template-rows auto
  grid-template-areas "side-left content"

.project-nav
  grid-area side-left

.content
  grid-area content
  overflow-x hidden
  overflow-y auto

</style>
