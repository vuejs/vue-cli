<template>
  <div
    class="folder-explorer"
    :class="{
      error
    }"
  >
    <div class="toolbar">
      <VueButton
        class="icon-button go-up"
        icon-left="keyboard_arrow_up"
        v-tooltip="$t('components.folder-explorer.toolbar.tooltips.parent-folder')"
        @click="openParentFolder"
      />

      <div v-if="editingPath" class="path-edit">
        <VueInput
          ref="pathInput"
          class="path-input"
          v-model="editedPath"
          :placeholder="$t('components.folder-explorer.toolbar.placeholder')"
          icon-right="edit"
          @keyup.esc="editingPath = false"
          @keyup.enter="submitPathEdit()"
        />
      </div>

      <ApolloQuery
        v-else
        :query="require('@/graphql/cwd.gql')"
        class="current-path"
        @dblclick.native="openPathEdit()"
      >
        <ApolloSubscribeToMore
          :document="require('@/graphql/cwdChanged.gql')"
          :update-query="cwdChangedUpdate"
        />

        <template slot-scope="{ result: { data } }">
          <div
            v-if="data"
            class="path-value"
          >
            <VueButton
              v-for="(slice, index) of slicePath(data.cwd)"
              :key="index"
              class="path-folder flat"
              :icon-left="!slice.name ? 'folder' : null"
              :class="{
                'icon-button': !slice.name
              }"
              @click="openFolder(slice.path)"
            >
              {{ slice.name }}
            </VueButton>
          </div>
          <VueButton
            class="edit-path-button icon-button"
            icon-left="edit"
            v-tooltip="$t('components.folder-explorer.toolbar.tooltips.edit-path')"
            @click="openPathEdit()"
          />
        </template>
      </ApolloQuery>

      <VueButton
        class="icon-button"
        icon-left="refresh"
        v-tooltip="$t('components.folder-explorer.toolbar.tooltips.refresh')"
        @click="refreshFolder"
      />

      <VueButton
        class="icon-button favorite-button"
        :icon-left="folderCurrent.favorite ? 'star' : 'star_border'"
        v-tooltip="$t('components.folder-explorer.toolbar.tooltips.favorite')"
        @click="toggleFavorite()"
      />

      <VueDropdown
        placement="bottom-end"
      >
        <VueButton
          slot="trigger"
          icon-left="arrow_drop_down"
          class="icon-button"
          v-tooltip="$t('components.folder-explorer.toolbar.tooltips.favorite-folders')"
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

        <div v-else class="vue-ui-empty">
          {{ $t('components.folder-explorer.toolbar.empty') }}
        </div>
      </VueDropdown>

      <VueIcon
        v-if="error"
        icon="error"
        class="error-icon big"
        v-tooltip="error.message"
      />

      <VueDropdown placement="bottom-end">
        <VueButton
          slot="trigger"
          icon-left="more_vert"
          class="icon-button"
        />

        <VueSwitch
          icon="visibility"
          v-model="showHidden"
          class="extend-left"
        >
          {{ $t('components.folder-explorer.toolbar.show-hidden') }}
        </VueSwitch>
      </VueDropdown>
    </div>

    <div ref="folders" class="folders">
      <template v-if="folderCurrent.children">
        <FolderExplorerItem
          v-for="folder of folderCurrent.children"
          v-if="showHidden || !folder.hidden"
          :key="folder.name"
          :folder="folder"
          @select="openFolder(folder.path)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import FOLDER_CURRENT from '../graphql/folderCurrent.gql'
import FOLDERS_FAVORITE from '../graphql/foldersFavorite.gql'
import FOLDER_OPEN from '../graphql/folderOpen.gql'
import FOLDER_OPEN_PARENT from '../graphql/folderOpenParent.gql'
import FOLDER_SET_FAVORITE from '../graphql/folderSetFavorite.gql'
import PROJECT_CWD_RESET from '../graphql/projectCwdReset.gql'

const SHOW_HIDDEN = 'vue-ui.show-hidden-folders'

export default {
  data () {
    return {
      error: false,
      editingPath: false,
      editedPath: '',
      folderCurrent: {},
      foldersFavorite: [],
      showHidden: localStorage.getItem(SHOW_HIDDEN) === 'true'
    }
  },

  apollo: {
    folderCurrent: {
      query: FOLDER_CURRENT,
      fetchPolicy: 'network-only',
      async result () {
        await this.$nextTick()
        this.$refs.folders.scrollTop = 0
      }
    },

    foldersFavorite: FOLDERS_FAVORITE
  },

  watch: {
    showHidden (value) {
      if (value) {
        localStorage.setItem(SHOW_HIDDEN, 'true')
      } else {
        localStorage.removeItem(SHOW_HIDDEN)
      }
    }
  },

  beforeRouteLeave (to, from, next) {
    if (to.matched.some(m => m.meta.needProject)) {
      this.resetProjectCwd()
    }
    next()
  },

  methods: {
    async openFolder (path) {
      this.editingPath = false
      this.error = null
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
        this.error = e
      }
    },

    async openParentFolder (folder) {
      this.editingPath = false
      this.error = null
      try {
        await this.$apollo.mutate({
          mutation: FOLDER_OPEN_PARENT,
          update: (store, { data: { folderOpenParent } }) => {
            store.writeQuery({ query: FOLDER_CURRENT, data: { folderCurrent: folderOpenParent } })
          }
        })
      } catch (e) {
        this.error = e
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
    },

    resetProjectCwd () {
      this.$apollo.mutate({
        mutation: PROJECT_CWD_RESET
      })
    },

    slicePath (path) {
      const parts = []
      let startIndex = 0
      let index

      const findSeparator = () => {
        index = path.indexOf('/', startIndex)
        if (index === -1) index = path.indexOf('\\', startIndex)
        return index !== -1
      }

      const addPart = index => {
        const folder = path.substring(startIndex, index)
        const slice = path.substring(0, index + 1)
        parts.push({
          name: folder,
          path: slice
        })
      }

      while (findSeparator()) {
        addPart(index)
        startIndex = index + 1
      }

      if (startIndex < path.length) addPart(path.length)

      return parts
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.toolbar
  padding $padding-item 0
  h-box()
  align-items center

  >>> > *
    space-between-x($padding-item)

.current-path
  flex 100% 1 1
  h-box()
  align-items stretch
  border-radius $br
  background $vue-ui-color-light-neutral
  .vue-ui-dark-mode &
    background $vue-ui-color-dark

  .path-value
    flex auto 1 1
    h-box()
    align-items stretch

  .path-folder
    padding 0 9px
    &:not(:first-child)
      position relative
      &::before
        display block
        content ''
        position absolute
        top 0
        left -1px
        height 100%
        width 2px
        background $vue-ui-color-light
        .vue-ui-dark-mode &
          background $vue-ui-color-darker

  .edit-path-button
    margin-left 4px

.path-edit
  flex 100% 1 1
  > .vue-ui-input
    width 100%

.favorite-button
  margin-right 4px

.error-icon
  >>> svg
    fill $vue-ui-color-danger

.folder-explorer
  v-box()
  align-items stretch

  .folders
    flex 100% 1 1
    overflow-x hidden
    overflow-y auto
</style>
