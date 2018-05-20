<template>
  <div class="project-plugins-add page">
    <div class="content">
      <StepWizard
        :title="$t('views.project-plugins-add.title')"
        class="frame"
        :tab-id.sync="tabId"
      >
        <template slot-scope="{ next, previous }">
          <VueTab
            id="search"
            :label="$t('views.project-plugins-add.tabs.search.label')"
            icon="search"
            disabled
          >
            <div class="content vue-ui-disable-scroll">
              <ais-index
                app-id="OFCNCOG2CU"
                api-key="db283631f89b5b8a10707311f911fd00"
                index-name="npm-search"
                :query-parameters="{
                  hitsPerPage: 20,
                  attributesToRetrieve: [
                    'name',
                    'description',
                    'repository',
                    'homepage',
                    'version',
                    'owner',
                    'humanDownloadsLast30Days'
                  ],
                  attributesToHighlight: [
                    'name',
                    'description'
                  ],
                  filters: `computedKeywords:vue-cli-plugin`
                }"
              >
                <InstantSearchInput
                  ref="searchInput"
                  :placeholder="$t('views.project-plugins-add.tabs.search.search-input')"
                />
                <ais-results ref="results">
                  <PackageSearchItem
                    slot-scope="{ result }"
                    :pkg="result"
                    :selected="selectedId === result.name"
                    @click.native="selectedId = result.name"
                  />
                </ais-results>
                <ais-no-results>
                  <div class="vue-ui-empty">
                    <VueIcon icon="search" class="huge"/>
                    <div>{{ $t('views.project-plugins-add.tabs.search.not-found') }}</div>
                  </div>
                </ais-no-results>
                <InstantSearchPagination @page-change="scrollResultsToTop()"/>
              </ais-index>
            </div>

            <div class="actions-bar no-padding-x">
              <VueButton
                icon-left="close"
                :label="$t('views.project-plugins-add.tabs.search.buttons.cancel')"
                class="big"
                @click="close()"
              />

              <div class="algolia">
                <img class="ais-logo" src="~@/assets/search-by-algolia.svg">
              </div>

              <VueButton
                icon-left="file_download"
                :label="$t('views.project-plugins-add.tabs.search.buttons.install', { target: selectedId || $t('views.project-plugins-add.plugin') })"
                class="big primary"
                :disabled="!selectedId"
                data-testid="download-plugin"
                @click="installPlugin()"
              />
            </div>
          </VueTab>

          <VueTab
            id="config"
            :label="$t('views.project-plugins-add.tabs.configuration.label')"
            icon="settings_applications"
            disabled
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <div class="cta-text">{{ $t('views.project-plugins-add.tabs.configuration.heading', { target: pluginId }) }}</div>
              <PromptsList
                :prompts="visiblePrompts"
                @answer="answerPrompt"
              />
            </div>

            <div class="actions-bar no-padding-x">
              <VueButton
                icon-left="arrow_back"
                :label="$t('views.project-plugins-add.tabs.configuration.buttons.cancel')"
                class="big"
                @click="showCancelInstall = true"
              />

              <VueButton
                icon-left="done"
                :label="$t('views.project-plugins-add.tabs.configuration.buttons.finish')"
                class="big primary"
                :disabled="!configurationValid"
                data-testid="finish-install"
                @click="invokePlugin()"
              />
            </div>
          </VueTab>

          <VueTab
            id="diff"
            :label="$t('views.project-plugins-add.tabs.diff.label')"
            icon="note_add"
            disabled
            lazy
          >
            <FileDiffView
              @continue="finishInstall()"
            />
          </VueTab>
        </template>
      </StepWizard>
    </div>

    <VueModal
      v-if="showCancelInstall"
      :title="$t('views.project-plugins-add.modal.title', { target: pluginId })"
      class="medium"
      @close="showCancelInstall = false"
    >
      <div class="default-body">
        {{ $t('views.project-plugins-add.modal.body', { target: pluginId }) }}
      </div>

      <div slot="footer" class="actions space-between">
        <VueButton
          :label="$t('views.project-plugins-add.modal.buttons.back')"
          class="flat"
          @click="showCancelInstall = false"
        />

        <div class="vue-ui-spacer"/>

        <VueButton
          :label="$t('views.project-plugins-add.modal.buttons.cancel')"
          class="flat"
          @click="cancelInstall()"
        />

        <VueButton
          :label="$t('views.project-plugins-add.modal.buttons.uninstall')"
          icon-left="delete_forever"
          class="danger"
          @click="uninstallPlugin()"
        />
      </div>
    </VueModal>

    <ProgressScreen
      progress-id="plugin-installation"
    />
  </div>
</template>

<script>
import Prompts from '../mixins/Prompts'

import PLUGIN_INSTALLATION from '../graphql/pluginInstallation.gql'
import PLUGIN_INSTALL from '../graphql/pluginInstall.gql'
import PLUGIN_UNINSTALL from '../graphql/pluginUninstall.gql'
import PLUGIN_INVOKE from '../graphql/pluginInvoke.gql'
import PLUGIN_FINISH_INSTALL from '../graphql/pluginFinishInstall.gql'

export default {
  name: 'ProjectPluginsAdd',

  mixins: [
    Prompts({
      field: 'pluginInstallation',
      query: PLUGIN_INSTALLATION
    })
  ],

  metaInfo () {
    return {
      title: this.$t('views.project-plugins-add.title')
    }
  },

  data () {
    return {
      tabId: 'search',
      selectedId: null,
      showCancelInstall: false,
      pluginInstallation: null
    }
  },

  apollo: {
    pluginInstallation: {
      query: PLUGIN_INSTALLATION,
      fetchPolicy: 'netork-only',
      result () {
        this.checkTab()
      }
    }
  },

  computed: {
    pluginId () {
      return this.pluginInstallation && this.pluginInstallation.pluginId
    }
  },

  mounted () {
    requestAnimationFrame(() => {
      this.$refs.searchInput.focus()
      this.checkTab()
    })
  },

  methods: {
    close () {
      this.$router.push({ name: 'project-home' })
    },

    checkTab () {
      if (!this.pluginInstallation) return

      if (this.pluginInstallation.pluginId) {
        this.tabId = 'config'
      } else {
        this.tabId = 'search'
      }

      switch (this.pluginInstallation.step) {
        case 'config':
          this.tabId = 'config'
          break
        case 'diff':
          this.tabId = 'diff'
          break
        default:
          this.tabId = 'search'
      }
    },

    async installPlugin () {
      try {
        await this.$apollo.mutate({
          mutation: PLUGIN_INSTALL,
          variables: {
            id: this.selectedId
          }
        })
        this.tabId = 'config'
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },

    cancelInstall () {
      this.selectedId = null
      this.tabId = 'search'
      this.showCancelInstall = false
    },

    async uninstallPlugin () {
      this.showCancelInstall = false
      try {
        await this.$apollo.mutate({
          mutation: PLUGIN_UNINSTALL,
          variables: {
            id: this.pluginId
          }
        })
        this.cancelInstall()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },

    async invokePlugin () {
      try {
        await this.$apollo.mutate({
          mutation: PLUGIN_INVOKE,
          variables: {
            id: this.pluginId
          }
        })
        this.tabId = 'diff'
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },

    async finishInstall () {
      try {
        await this.$apollo.mutate({
          mutation: PLUGIN_FINISH_INSTALL
        })
        this.close()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    },

    scrollResultsToTop () {
      const vm = this.$refs.results
      if (vm) vm.$el.scrollTop = 0
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-plugins-add
  display grid
  grid-template-columns 1fr
  grid-template-rows auto
  grid-template-areas "content"

.content
  grid-area content
  overflow hidden

.algolia
  position absolute
  margin 0 auto
  top 0
  left 0
  width 100%
  height 100%
  pointer-events none
  h-box()
  box-center()
</style>
