<template>
  <div
    class="project-home page"
    :class="{
      wide: $responsive.wide
    }"
  >
    <TopBar />

    <div class="panes">
      <ProjectNav/>

      <div v-if="ready" class="content vue-ui-disable-scroll">
        <router-view/>
      </div>
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
  display flex
  flex-direction column

  &.wide
    .project-nav
      width 180px

.panes
  flex auto 1 1
  height 100%
  display flex
  overflow hidden

.top-bar,
.project-nav
  flex auto 0 0

.project-nav
  width 46px

.content
  flex auto 1 1
  width 0
  overflow-x hidden
  overflow-y auto

</style>
