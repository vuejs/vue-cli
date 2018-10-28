<template>
  <div class="project-dependencies page">
    <ContentView
      :title="$t('org.vue.views.project-dependencies.title')"
      class="limit-width list"
    >
      <template slot="actions">
        <VueInput
          v-model="search"
          icon-left="search"
          class="round"
        />

        <VueButton
          icon-left="add"
          :label="$t('org.vue.views.project-dependencies.actions.install')"
          class="primary round"
          @click="showInstallModal = true"
        />

        <VueDropdown>
          <VueButton
            slot="trigger"
            icon-left="more_vert"
            class="icon-button flat round"
          />

          <VueDropdownButton
            icon-left="file_download"
            :label="$t('org.vue.views.project-dependencies.actions.update-all')"
            @click="updateAll()"
          />
        </VueDropdown>
      </template>

      <ApolloQuery
        :query="require('@/graphql/dependency/dependencies.gql')"
      >
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator
            v-if="loading && (!data || !data.dependencies)"
            class="overlay"
          />

          <ListFilter
            v-else-if="data && data.dependencies"
            :list="data.dependencies"
            :filter="item => !search || item.id.includes(search)"
          >
            <template slot-scope="{ list }">
              <ListFilter
                v-for="type of ['dependencies', 'devDependencies']"
                :key="type"
                :list="list"
                :filter="item => item.type === type"
              >
                <template slot-scope="{ list }" v-if="list.length">
                  <div class="cta-text">{{ $t(`org.vue.views.project-dependencies.heading.${type}`) }}</div>

                  <ListSort
                    :list="list"
                    :compare="(a, b) => a.id.localeCompare(b.id)"
                  >
                    <template slot-scope="{ list }">
                      <ProjectDependencyItem
                        v-for="dependency of list"
                        :key="dependency.id"
                        :dependency="dependency"
                        @uninstall="openConfirmUninstall(dependency.id)"
                      />
                    </template>
                  </ListSort>
                </template>
              </ListFilter>
            </template>
          </ListFilter>
        </template>
      </ApolloQuery>
    </ContentView>

    <VueModal
      v-if="showInstallModal"
      :title="$t('org.vue.views.project-dependencies.install.title')"
      class="install-modal"
      @close="showInstallModal = false"
    >
      <div class="default-body">
        <div class="install-options">
          <VueGroup v-model="installType" class="inline">
            <VueGroupButton
              v-for="type of ['dependencies', 'devDependencies']"
              :key="type"
              :value="type"
            >
              {{ $t(`org.vue.views.project-dependencies.heading.${type}`) }}
            </VueGroupButton>
          </VueGroup>
        </div>

        <NpmPackageSearch
          filters="NOT computedKeywords:vue-cli-plugin"
          class="package-search"
          @close="showInstallModal = false"
          @install="installPlugin"
        />
      </div>
    </VueModal>

    <VueModal
      v-if="showUninstallModal"
      :title="$t('org.vue.views.project-dependencies.uninstall.title')"
      class="small"
      @close="showUninstallModal = false"
    >
      <div class="default-body">
        {{ $t('org.vue.views.project-dependencies.uninstall.body', { id: selectedId }) }}
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          :label="$t('org.vue.views.project-dependencies.uninstall.cancel')"
          class="flat"
          @click="showUninstallModal = false"
        />

        <VueButton
          :label="$t('org.vue.views.project-dependencies.uninstall.uninstall', { id: selectedId })"
          icon-left="delete_forever"
          class="danger"
          @click="uninstallPlugin(selectedId)"
        />
      </div>
    </VueModal>

    <ProgressScreen progress-id="dependency-installation"/>
  </div>
</template>

<script>
import DEPENDENCIES from '@/graphql/dependency/dependencies.gql'
import DEPENDENCY_INSTALL from '@/graphql/dependency/dependencyInstall.gql'
import DEPENDENCY_UNINSTALL from '@/graphql/dependency/dependencyUninstall.gql'
import DEPENDENCIES_UPDATE from '@/graphql/dependency/dependenciesUpdate.gql'

export default {
  data () {
    return {
      showInstallModal: false,
      installType: 'dependencies',
      selectedId: null,
      showUninstallModal: false,
      search: ''
    }
  },

  methods: {
    async updateAll () {
      await this.$apollo.mutate({
        mutation: DEPENDENCIES_UPDATE
      })
    },

    async installPlugin (id) {
      await this.$apollo.mutate({
        mutation: DEPENDENCY_INSTALL,
        variables: {
          input: {
            id,
            type: this.installType
          }
        },
        update: (store, { data: { dependencyInstall } }) => {
          let data = store.readQuery({ query: DEPENDENCIES })
          // TODO this is a workaround
          // See: https://github.com/apollographql/apollo-client/issues/4031#issuecomment-433668473
          data = {
            dependencies: [...data.dependencies, dependencyInstall]
          }
          store.writeQuery({ query: DEPENDENCIES, data })
        }
      })

      this.showInstallModal = false
    },

    openConfirmUninstall (id) {
      this.selectedId = id
      this.showUninstallModal = true
    },

    async uninstallPlugin (id) {
      this.showUninstallModal = false

      await this.$apollo.mutate({
        mutation: DEPENDENCY_UNINSTALL,
        variables: {
          input: {
            id
          }
        },
        update: (store, { data: { dependencyUninstall } }) => {
          let data = store.readQuery({ query: DEPENDENCIES })
          const index = data.dependencies.findIndex(d => d.id === dependencyUninstall.id)
          if (index !== -1) {
            // TODO this is a workaround
            // See: https://github.com/apollographql/apollo-client/issues/4031#issuecomment-433668473
            data = {
              dependencies: data.dependencies.slice()
            }
            data.dependencies.splice(index, 1)
            store.writeQuery({ query: DEPENDENCIES, data })
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-dependencies
  .content-view /deep/ > .content
    overflow-y auto

.install-modal >>> .shell
  width 80vw
  max-width 1200px

.install-options
  h-box()
  box-center()
  margin-bottom $padding-item

.package-search
  height 70vh
</style>
