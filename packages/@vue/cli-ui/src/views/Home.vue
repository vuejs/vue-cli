<template>
  <div class="home page">
    <FolderExplorer/>
  </div>
</template>

<script>
import FolderExplorer from '../components/FolderExplorer'

export default {
  name: 'home',

  components: {
    FolderExplorer
  }
}
</script>

<style lang="stylus" scoped>
.folder-explorer
  height 100%
</style>
