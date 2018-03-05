<template>
  <div
    class="folder-explorer"
    :class="{
      error
    }"
  >
    <div class="toolbar">
      <VueButton
        class="icon-button"
        icon-left="keyboard_arrow_up"
        v-tooltip="'Open parent folder'"
        @click="openParentFolder"
      />

      <div v-if="editingPath" class="path-edit">
        <VueInput
          ref="pathInput"
          v-model="editedPath"
          placeholder="Enter the full path to a folder"
          icon-left="edit"
          @keyup.esc="editingPath = false"
          @keyup.enter="submitPathEdit()"
        />
      </div>

      <ApolloQuery
        v-else
        ref="cwd"
        :query="require('@/graphql/cwd.gql')"
        class="current-path"
        v-tooltip="'Edit path'"
        @click.native="openPathEdit()"
      >
        <ApolloSubscribeToMore
          :document="require('@/graphql/cwdChanged.gql')"
          :update-query="cwdChangedUpdate"
        />

        <template slot-scope="{ result: { data } }">
          <span v-if="data">{{ data.cwd }}</span>
        </template>
      </ApolloQuery>

      <VueIcon
        v-if="error"
        icon="error"
        class="error-icon big"
      />

      <VueButton
        class="icon-button"
        icon-left="refresh"
        v-tooltip="'Refresh'"
        @click="refreshFolder"
      />
    </div>

    <ApolloQuery
      :query="require('@/graphql/folderCurrent.gql')"
      class="folders"
    >
      <template slot-scope="{ result: { data } }">
        <template v-if="data">
          <FolderExplorerItem
            v-for="folder of data.folderCurrent.children"
            :key="folder.name"
            :folder="folder"
            @click.native="openFolder(folder.path)"
          />
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import FolderExplorerItem from './FolderExplorerItem'
import FOLDER_OPEN from '@/graphql/folderOpen.gql'
import FOLDER_OPEN_PARENT from '@/graphql/folderOpenParent.gql'
import FOLDER_CURRENT from '@/graphql/folderCurrent.gql'

export default {
  components: {
    FolderExplorerItem,
  },

  data () {
    return {
      error: false,
      editingPath: false,
      editedPath: '',
    }
  },

  methods: {
    async openFolder (path) {
      this.editingPath = false
      this.error = false
      try {
        await this.$apollo.mutate({
          mutation: FOLDER_OPEN,
          variables: {
            path
          },
          update: (store, { data: { folderOpen } }) => {
            store.writeQuery({ query: FOLDER_CURRENT, data: { folderCurrent: folderOpen } })
          }
        })
      } catch (e) {
        this.error = true
      }
    },

    async openParentFolder (folder) {
      this.editingPath = false
      this.error = false
      try {
        await this.$apollo.mutate({
          mutation: FOLDER_OPEN_PARENT,
          update: (store, { data: { folderOpenParent } }) => {
            store.writeQuery({ query: FOLDER_CURRENT, data: { folderCurrent: folderOpenParent } })
          }
        })
      } catch (e) {
        this.error = true
      }
    },

    cwdChangedUpdate (previousResult, { subscriptionData }) {
      return {
        cwd: subscriptionData.data.cwd
      }
    },

    async openPathEdit () {
      this.editedPath = this.$refs.cwd.result.data.cwd
      this.editingPath = true
      await this.$nextTick()
      this.$refs.pathInput.focus()
    },

    submitPathEdit () {
      this.openFolder(this.editedPath)
    },

    refreshFolder () {
      this.openFolder(this.$refs.cwd.result.data.cwd)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.toolbar
  padding 12px
  background rgba($vue-color-light-neutral, .2)
  h-box()
  align-items center

  >>> > *
    space-between-x(12px)

.current-path
  flex 100% 1 1
  ellipsis()
  cursor pointer

.path-edit
  flex 100% 1 1
  > .vue-input
    width 100%

.error-icon
  >>> svg
    fill $vue-color-danger

.folder-explorer
  v-box()
  align-items stretch

  .folders
    flex 100% 1 1
    overflow-x hidden
    overflow-y auto

  &.error
    .current-path
      color $vue-color-danger
</style>
