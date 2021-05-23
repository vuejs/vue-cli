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
        v-tooltip="$t('org.vue.components.folder-explorer.toolbar.tooltips.parent-folder')"
        @click="openParentFolder"
      />

      <div v-if="editingPath" class="path-edit">
        <VueInput
          ref="pathInput"
          class="path-input"
          v-model="editedPath"
          :placeholder="$t('org.vue.components.folder-explorer.toolbar.placeholder')"
          icon-right="edit"
          v-focus
          @keyup.esc="editingPath = false"
          @keyup.enter="submitPathEdit()"
        />
      </div>

      <ApolloQuery
        v-else
        :query="require('@/graphql/cwd/cwd.gql')"
        class="current-path"
        @dblclick.native="openPathEdit()"
      >
        <ApolloSubscribeToMore
          :document="require('@/graphql/cwd/cwdChanged.gql')"
          :update-query="cwdChangedUpdate"
        />

        <template slot-scope="{ result: { data } }">
          <div
            v-if="data"
            class="path-value"
          >
            <div
              v-for="(slice, index) of slicePath(data.cwd)"
              :key="index"
              class="path-part"
            >
              <VueButton
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
          </div>
          <VueButton
            class="edit-path-button icon-button"
            icon-left="edit"
            v-tooltip="$t('org.vue.components.folder-explorer.toolbar.tooltips.edit-path')"
            @click="openPathEdit()"
          />
        </template>
      </ApolloQuery>

      <VueIcon
        v-if="error"
        icon="error"
        class="error-icon big"
        v-tooltip="error.message"
      />

      <VueButton
        class="icon-button"
        icon-left="refresh"
        v-tooltip="$t('org.vue.components.folder-explorer.toolbar.tooltips.refresh')"
        @click="refreshFolder"
      />

      <VueButton
        class="icon-button favorite-button"
        :icon-left="folderCurrent.favorite ? 'star' : 'star_border'"
        v-tooltip="$t('org.vue.components.folder-explorer.toolbar.tooltips.favorite')"
        @click="toggleFavorite()"
      />

      <VueDropdown
        placement="bottom-end"
      >
        <VueButton
          slot="trigger"
          icon-left="arrow_drop_down"
          class="icon-button"
          v-tooltip="$t('org.vue.components.folder-explorer.toolbar.tooltips.favorite-folders')"
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
          {{ $t('org.vue.components.folder-explorer.toolbar.empty') }}
        </div>
      </VueDropdown>

      <VueDropdown placement="bottom-end">
        <VueButton
          slot="trigger"
          icon-left="more_vert"
          class="icon-button"
        />

        <VueDropdownButton
          :label="$t('org.vue.components.folder-explorer.new-folder.action')"
          icon-left="create_new_folder"
          @click="showNewFolder = true"
        />

        <VueSwitch
          icon="visibility"
          v-model="showHidden"
          class="extend-left"
        >
          {{ $t('org.vue.components.folder-explorer.toolbar.show-hidden') }}
        </VueSwitch>
      </VueDropdown>
    </div>

    <div ref="folders" class="folders">
      <transition name="vue-ui-fade">
        <VueLoadingBar
          v-if="loading"
          class="ghost primary"
          unknown
        />
      </transition>
      <template v-if="folderCurrent && folderCurrent.children">
        <template v-for="folder of folderCurrent.children">
          <FolderExplorerItem
            v-if="showHidden || !folder.hidden"
            :key="folder.name"
            :folder="folder"
            @select="openFolder(folder.path)"
          />
        </template>
      </template>
    </div>

    <VueModal
      v-if="showNewFolder"
      :title="$t('org.vue.components.folder-explorer.new-folder.title')"
      class="small new-folder-modal"
      @close="showNewFolder = false"
    >
      <div class="default-body">
        <VueFormField
          :title="$t('org.vue.components.folder-explorer.new-folder.field.title')"
          :subtitle="$t('org.vue.components.folder-explorer.new-folder.field.subtitle')"
        >
          <VueInput
            v-model="newFolderName"
            icon-left="folder"
            v-focus
            @keyup.enter="createFolder()"
          />
        </VueFormField>
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          :label="$t('org.vue.components.folder-explorer.new-folder.cancel')"
          class="flat close"
          @click="showNewFolder = false"
        />

        <VueButton
          :label="$t('org.vue.components.folder-explorer.new-folder.create')"
          icon-left="create_new_folder"
          class="primary save"
          :disabled="!newFolderValid"
          @click="createFolder()"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import { isValidMultiName } from '@/util/folders'

import FOLDER_CURRENT from '@/graphql/folder/folderCurrent.gql'
import FOLDERS_FAVORITE from '@/graphql/folder/foldersFavorite.gql'
import FOLDER_OPEN from '@/graphql/folder/folderOpen.gql'
import FOLDER_OPEN_PARENT from '@/graphql/folder/folderOpenParent.gql'
import FOLDER_SET_FAVORITE from '@/graphql/folder/folderSetFavorite.gql'
import PROJECT_CWD_RESET from '@/graphql/project/projectCwdReset.gql'
import FOLDER_CREATE from '@/graphql/folder/folderCreate.gql'

const SHOW_HIDDEN = 'vue-ui.show-hidden-folders'

export default {
  data () {
    return {
      loading: 0,
      error: false,
      editingPath: false,
      editedPath: '',
      folderCurrent: {},
      foldersFavorite: [],
      showHidden: localStorage.getItem(SHOW_HIDDEN) === 'true',
      showNewFolder: false,
      newFolderName: ''
    }
  },

  apollo: {
    folderCurrent: {
      query: FOLDER_CURRENT,
      fetchPolicy: 'network-only',
      loadingKey: 'loading',
      async result () {
        await this.$nextTick()
        this.$refs.folders.scrollTop = 0
      }
    },

    foldersFavorite: FOLDERS_FAVORITE
  },

  computed: {
    newFolderValid () {
      return isValidMultiName(this.newFolderName)
    }
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
      this.loading++
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
      this.loading--
    },

    async openParentFolder (folder) {
      this.editingPath = false
      this.error = null
      this.loading++
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
      this.loading--
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

          let data = store.readQuery({ query: FOLDERS_FAVORITE })
          // TODO this is a workaround
          // See: https://github.com/apollographql/apollo-client/issues/4031#issuecomment-433668473
          data = {
            foldersFavorite: data.foldersFavorite.slice()
          }
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
    },

    async createFolder () {
      if (!this.newFolderValid) return

      const result = await this.$apollo.mutate({
        mutation: FOLDER_CREATE,
        variables: {
          name: this.newFolderName
        }
      })

      this.openFolder(result.data.folderCreate.path)

      this.newFolderName = ''
      this.showNewFolder = false
    }
  }
}
</script>

<style lang="stylus" scoped>
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

  .path-part
    &:not(:first-child)
      border-left 2px solid
      border-left-color $vue-ui-color-light
      .vue-ui-dark-mode &
        border-left-color $vue-ui-color-darker

  .path-folder
    padding 0 9px

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
    position relative
</style>
