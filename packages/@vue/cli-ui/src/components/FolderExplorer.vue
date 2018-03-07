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
        class="icon-button favorite-button"
        :icon-left="folderCurrent.favorite ? 'star' : 'star_border'"
        v-tooltip="'Toggle favorite'"
        @click="toggleFavorite"
      />

      <VueDropdown
        placement="bottom-end"
      >
        <VueButton
          slot="trigger"
          icon-left="arrow_drop_down"
          class="icon-button"
          v-tooltip="'Favorite folders'"
        />

        <template v-if="foldersFavorite.length">
          <VueDropdownButton
            v-for="folder of foldersFavorite"
            :key="folder.path"
            :label="folder.path"
            icon-left="folder"
            @click="openFolder(folder.path)"
          />
        </template>

        <div v-else class="vue-empty">
          No favorite folders yet.
        </div>
      </VueDropdown>

      <VueButton
        class="icon-button"
        icon-left="refresh"
        v-tooltip="'Refresh'"
        @click="refreshFolder"
      />
    </div>

    <div class="folders">
      <template v-if="folderCurrent.children">
        <FolderExplorerItem
          v-for="folder of folderCurrent.children"
          :key="folder.name"
          :folder="folder"
          @click.native="openFolder(folder.path)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import FolderExplorerItem from './FolderExplorerItem'
import FOLDER_CURRENT from '../graphql/folderCurrent.gql'
import FOLDERS_FAVORITE from '../graphql/foldersFavorite.gql'
import FOLDER_OPEN from '../graphql/folderOpen.gql'
import FOLDER_OPEN_PARENT from '../graphql/folderOpenParent.gql'
import FOLDER_SET_FAVORITE from '../graphql/folderSetFavorite.gql'

export default {
  components: {
    FolderExplorerItem,
  },

  data () {
    return {
      error: false,
      editingPath: false,
      editedPath: '',
      folderCurrent: {},
      foldersFavorite: [],
    }
  },

  apollo: {
    folderCurrent: FOLDER_CURRENT,
    foldersFavorite: FOLDERS_FAVORITE
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

    async toggleFavorite () {
      await this.$apollo.mutate({
        mutation: FOLDER_SET_FAVORITE,
        variables: {
          path: this.folderCurrent.path,
          favorite: !this.folderCurrent.favorite
        },
        update: (store, { data: { folderSetFavorite } }) => {
          store.writeQuery({ query: FOLDER_CURRENT, data: { folderCurrent: folderSetFavorite } })

          const data = store.readQuery({ query: FOLDERS_FAVORITE })
          if (folderSetFavorite.favorite) {
            data.foldersFavorite.push(folderSetFavorite)
          } else {
            const index = data.foldersFavorite.findIndex(
              f => f.path === folderSetFavorite.path
            )
            index !== -1 && data.foldersFavorite.splice(index, 1)
          }
          store.writeQuery({ query: FOLDERS_FAVORITE, data })
        }
      })
    },

    cwdChangedUpdate (previousResult, { subscriptionData }) {
      return {
        cwd: subscriptionData.data.cwd
      }
    },

    async openPathEdit () {
      this.editedPath = this.folderCurrent.path
      this.editingPath = true
      await this.$nextTick()
      this.$refs.pathInput.focus()
    },

    submitPathEdit () {
      this.openFolder(this.editedPath)
    },

    refreshFolder () {
      this.openFolder(this.folderCurrent.path)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.toolbar
  padding $padding-item
  background $color-light-background
  h-box()
  align-items center

  >>> > *
    space-between-x($padding-item)

.current-path
  flex 100% 1 1
  ellipsis()
  cursor pointer

.path-edit
  flex 100% 1 1
  > .vue-input
    width 100%

.favorite-button
  margin-right 4px

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
