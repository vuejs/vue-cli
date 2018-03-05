<template>
  <div class="status-bar">
    <div class="section current-project">
      <span>Current Project:</span>
    </div>

    <div class="section console-log" v-tooltip="'Console'">
      <VueIcon icon="subtitles"/>
      <span>{{ consoleLog }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      consoleLog: ''
    }
  }
}
</script>


<style lang="stylus" scoped>
@import "~@/style/imports"

.status-bar
  h-box()
  align-items center
  background $vue-color-light-neutral
  font-size 12px

  .section
    h-box()
    align-items center
    opacity .5
    padding 0 8px
    height 100%
    cursor default

    &:hover
      opacity 1
      background lighten(@background, 40%)
</style>
