<template>
  <div class="project-plugin-add-local">
    <FolderExplorer/>

    <div class="actions-bar center">
      <VueButton
        icon-left="add"
        :label="$t('org.vue.views.project-plugin-add-local.buttons.add')"
        class="big primary"
        @click="addPlugin()"
      />
    </div>
  </div>
</template>

<script>
import PLUGIN_INSTALL_LOCAL from '@/graphql/plugin/pluginInstallLocal.gql'

export default {
  methods: {
    async addPlugin () {
      await this.$apollo.mutate({
        mutation: PLUGIN_INSTALL_LOCAL
      })
      this.$emit('installed')
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-plugin-add-local
  width 70vw
  height 70vh
  display flex
  flex-direction column

.folder-explorer
  flex 1
  overflow hidden
</style>
