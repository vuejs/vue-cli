<template>
  <div
    class="project-home page"
    :class="{
      wide: $responsive.wide
    }"
  >
    <TopBar />
    <ProjectNav/>

    <div v-if="ready" class="content">
      <router-view/>
    </div>

    <ProgressScreen progress-id="__plugins__"/>
  </div>
</template>

<script>
import PROJECT_CWD_RESET from '../graphql/projectCwdReset.gql'

export default {
  name: 'ProjectHome',

  data () {
    return {
      ready: false
    }
  },

  async created () {
    await this.$apollo.mutate({
      mutation: PROJECT_CWD_RESET
    })
    this.ready = true
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-home
  display grid
  grid-template-columns 46px 1fr
  grid-template-rows auto 1fr
  grid-template-areas "topbar topbar" "side-left content"

  &.wide
    grid-template-columns 180px 1fr

.top-bar
  grid-area topbar

.project-nav
  grid-area side-left

.content
  grid-area content
  overflow-x hidden
  overflow-y auto

</style>
