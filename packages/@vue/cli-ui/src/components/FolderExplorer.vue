<template>
  <div class="folder-explorer">
    <div class="toolbar">
      <VueButton
        class="icon-button"
        icon-left="keyboard_arrow_up"
        @click="openParentFolder"
      />

      <ApolloQuery
        :query="require('@/graphql/cwd.gql')"
        class="current-path"
      >
        <ApolloSubscribeToMore
          :document="require('@/graphql/cwdChanged.gql')"
          :update-query="cwdChangedUpdate"
        />

        <template slot-scope="{ result: { data } }">
          <span v-if="data">{{ data.cwd }}</span>
        </template>
      </ApolloQuery>
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
            @click.native="openFolder(folder)"
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

  methods: {
    openFolder (folder) {
      this.$apollo.mutate({
        mutation: FOLDER_OPEN,
        variables: {
          path: folder.path
        },
        update: (store, { data: { folderOpen } }) => {
          store.writeQuery({ query: FOLDER_CURRENT, data: { folderCurrent: folderOpen } })
        }
      })
    },

    openParentFolder (folder) {
      this.$apollo.mutate({
        mutation: FOLDER_OPEN_PARENT,
        update: (store, { data: { folderOpenParent } }) => {
          store.writeQuery({ query: FOLDER_CURRENT, data: { folderCurrent: folderOpenParent } })
        }
      })
    },

    cwdChangedUpdate (previousResult, { subscriptionData }) {
      return {
        cwd: subscriptionData.data.cwd
      }
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

.current-path
  flex 100% 1 1
  ellipsis()
  margin-left 12px
</style>
