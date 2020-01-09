<template>
  <div
    class="project-home page"
    :class="{
      wide: $responsive.wide
    }"
  >
    <div class="panes">
      <ViewNav/>

      <div v-if="ready" class="content vue-ui-disable-scroll">
        <TopBar />
        <router-view class="router-view"/>
      </div>
    </div>

    <ProgressScreen progress-id="__plugins__"/>
  </div>
</template>

<script>
import PROJECT_CWD_RESET from '@/graphql/project/projectCwdReset.gql'

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
.project-home
  display flex
  flex-direction column

  &.wide
    .project-nav
      width 220px

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
  display flex
  flex-direction column

.top-bar
  flex auto 0 0

.router-view
  flex 1
  height 0
  overflow hidden
</style>
