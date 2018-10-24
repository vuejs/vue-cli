<template>
  <div class="project-create page">
    <div class="content">
      <StepWizard
        :title="$t('org.vue.views.project-create.title')"
        class="frame"
      >
        <template slot-scope="{ next, previous }">
          <VueTab
            id="details"
            class="details"
            :label="$t('org.vue.views.project-create.tabs.details.title')"
            icon="subject"
          >
            <div class="content vue-ui-disable-scroll">
              <div class="project-details vue-ui-grid col-1">
                <VueFormField
                  :title="$t('org.vue.views.project-create.tabs.details.form.folder.label')"
                >
                  <VueInput
                    v-model="formData.folder"
                    :placeholder="$t('org.vue.views.project-create.tabs.details.form.folder.placeholder')"
                    icon-left="folder"
                    class="big app-name"
                  />

                  <div slot="subtitle">
                    <div class="project-path">
                      <div class="path">
                        <span
                          class="cwd"
                          v-tooltip="cwd"
                        >
                          {{ cwd | folder(42 - formData.folder.length) }}
                        </span>
                        <span class="folder">{{ formData.folder }}</span>
                      </div>

                      <VueButton
                        icon-left="edit"
                        class="icon-button change-folder"
                        v-tooltip="$t('org.vue.views.project-create.tabs.details.form.folder.tooltip')"
                        :to="{
                          name: 'project-select',
                          query: {
                            tab: 'create',
                            hideTabs: true
                          }
                        }"
                      />
                    </div>

                    <div
                      v-if="formData.folder && !folderNameValid"
                      class="vue-ui-text danger banner"
                    >
                      <VueIcon icon="error" class="big"/>
                      <span>{{ $t('org.vue.views.project-create.tabs.details.form.folder.folder-name-invalid') }}</span>
                    </div>

                    <ApolloQuery
                      v-if="formData.folder"
                      :query="require('@/graphql/folder/folderExists.gql')"
                      :variables="{
                        file: `${cwd}/${formData.folder}`
                      }"
                      fetch-policy="no-cache"
                    >
                      <div
                        slot-scope="{ result: { data } }"
                        v-if="data && data.folderExists"
                        class="vue-ui-text warning banner"
                      >
                        <VueIcon icon="warning" class="big"/>
                        <span>{{ $t('org.vue.views.project-create.tabs.details.form.folder.folder-exists') }}</span>
                      </div>
                    </ApolloQuery>
                  </div>
                </VueFormField>

                <VueFormField
                  :title="$t('org.vue.views.project-create.tabs.details.form.manager.label')"
                >
                  <VueSelect
                    v-model="formData.packageManager"
                  >
                    <VueSelectButton
                      :value="undefined"
                      :label="$t('org.vue.views.project-create.tabs.details.form.manager.default')"
                    />
                    <VueSelectButton
                      value="npm"
                      label="npm"
                    />
                    <VueSelectButton
                      value="yarn"
                      label="yarn"
                    />
                  </VueSelect>
                </VueFormField>

                <VueFormField
                  :title="$t('org.vue.views.project-create.tabs.details.form.options.label')"
                >
                  <VueSwitch
                    v-model="formData.force"
                    class="extend-left force"
                  >
                    {{ $t('org.vue.views.project-create.tabs.details.form.options.force') }}
                  </VueSwitch>
                </VueFormField>

                <VueFormField
                  :title="$t('org.vue.views.project-create.tabs.details.form.options.git-title')"
                >
                  <VueSwitch
                    v-model="formData.enableGit"
                    class="extend-left git"
                  >
                    {{ $t('org.vue.views.project-create.tabs.details.form.options.git') }}
                  </VueSwitch>
                  <VueInput
                    v-model="formData.gitCommitMessage"
                    v-show="formData.enableGit"
                    :placeholder="$t('org.vue.views.project-create.tabs.details.form.options.git-commit-message')"
                  />
                </VueFormField>
              </div>
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="close"
                :label="$t('org.vue.views.project-create.tabs.details.buttons.cancel')"
                class="big close"
                @click="showCancel = true"
              />

              <VueButton
                icon-right="arrow_forward"
                :label="$t('org.vue.views.project-create.tabs.details.buttons.next')"
                class="big primary next"
                :disabled="!detailsValid"
                @click="next()"
              />
            </div>
          </VueTab>

          <VueTab
            id="presets"
            class="presets"
            :label="$t('org.vue.views.project-create.tabs.presets.title')"
            icon="check_circle"
            :disabled="!detailsValid"
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <div class="vue-ui-text info banner">
                <VueIcon icon="info" class="big"/>
                <span>{{ $t('org.vue.views.project-create.tabs.presets.description') }}</span>
              </div>

              <div class="cta-text">
                {{ $t('org.vue.views.project-create.tabs.presets.select') }}
              </div>

              <template v-if="projectCreation">
                <ProjectPresetItem
                  v-for="preset of projectCreation.presets"
                  :key="preset.id"
                  :preset="preset"
                  :selected="formData.selectedPreset === preset.id"
                  @click.native="selectPreset(preset.id)"
                />
              </template>

              <ProjectPresetItem
                :preset="remotePresetInfo"
                :selected="formData.selectedPreset === '__remote__'"
                :description="formData.remotePreset.url"
                @click.native="selectPreset('__remote__')"
              />
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                :label="$t('org.vue.views.project-create.tabs.presets.buttons.previous')"
                class="big previous"
                @click="previous()"
              />

              <VueButton
                v-if="manual"
                icon-right="arrow_forward"
                :label="$t('org.vue.views.project-create.tabs.presets.buttons.next')"
                class="big primary next"
                :disabled="!presetValid"
                @click="next()"
              />
              <VueButton
                v-else
                icon-left="done"
                :label="$t('org.vue.views.project-create.tabs.presets.buttons.create')"
                class="big primary next"
                :disabled="!formData.selectedPreset"
                @click="createWithoutSaving()"
              />
            </div>
          </VueTab>

          <VueTab
            id="features"
            class="features"
            :label="$t('org.vue.views.project-create.tabs.features.title')"
            icon="device_hub"
            :disabled="!detailsValid || !presetValid || !manual"
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <div class="vue-ui-text info banner">
                <VueIcon icon="info" class="big"/>
                <span>{{ $t('org.vue.views.project-create.tabs.features.description') }}</span>
              </div>

              <div class="cta-text">
                {{ $t('org.vue.views.project-create.tabs.features.enable') }}
              </div>

              <template v-if="projectCreation">
                <ProjectFeatureItem
                  v-for="feature of projectCreation.features"
                  :key="feature.id"
                  :feature="feature"
                  @click.native="toggleFeature(feature)"
                />
              </template>
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                :label="$t('org.vue.views.project-create.tabs.features.buttons.previous')"
                class="big previous"
                @click="previous()"
              />

              <VueButton
                v-if="visiblePrompts.length"
                icon-right="arrow_forward"
                :label="$t('org.vue.views.project-create.tabs.features.buttons.next')"
                class="big primary next"
                @click="next()"
              />
              <VueButton
                v-else
                icon-left="done"
                :label="$t('org.vue.views.project-create.tabs.features.buttons.create')"
                class="big primary next"
                @click="showSavePreset = true"
              />
            </div>
          </VueTab>

          <!-- <VueTab
            id="plugins"
            label="Plugins"
            icon="widgets"
            :disabled="!detailsValid || !presetValid"
            lazy
          >
            <div class="content vue-ui-disable-scroll">

            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                label="Previous"
                class="big"
                @click="previous()"
              />

              <VueButton
                icon-right="arrow_forward"
                label="Next"
                class="big primary"
                @click="next()"
              />
            </div>
          </VueTab> -->

          <VueTab
            id="config"
            class="config"
            :label="$t('org.vue.views.project-create.tabs.configuration.title')"
            icon="settings_applications"
            :disabled="!detailsValid || !presetValid || !manual || !visiblePrompts.length"
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <PromptsList
                :prompts="visiblePrompts"
                @answer="answerPrompt"
              />
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                :label="$t('org.vue.views.project-create.tabs.configuration.buttons.previous')"
                class="big previous"
                @click="previous()"
              />

              <VueButton
                icon-left="done"
                :label="$t('org.vue.views.project-create.tabs.configuration.buttons.create')"
                class="big primary next"
                :disabled="!configurationValid"
                @click="showSavePreset = true"
              />
            </div>
          </VueTab>
        </template>
      </StepWizard>
    </div>

    <VueModal
      v-if="showRemotePreset"
      :title="$t('org.vue.views.project-create.tabs.presets.modal.title')"
      class="small remove-preset-modal"
      @close="closeRemotePresetModal()"
    >
      <div class="default-body vue-ui-grid big-gap col-1">
        <VueFormField
          :title="$t('org.vue.views.project-create.tabs.presets.remote.url.title')"
          :subtitle="$t('org.vue.views.project-create.tabs.presets.remote.url.subtitle')"
        >
          <VueInput
            v-model="formData.remotePreset.url"
            icon-left="language"
            v-focus
          />
        </VueFormField>

        <VueFormField
          :title="$t('org.vue.views.project-create.tabs.presets.remote.options')"
        >
          <VueSwitch
            v-model="formData.remotePreset.clone"
            class="extend-left"
            :disabled="remoteNotGithub"
          >
            {{ $t('org.vue.views.project-create.tabs.presets.remote.clone') }}
          </VueSwitch>
        </VueFormField>
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          :label="$t('org.vue.views.project-create.tabs.presets.remote.cancel')"
          class="flat"
          @click="closeRemotePresetModal(true)"
        />

        <VueButton
          :label="$t('org.vue.views.project-create.tabs.presets.remote.done')"
          :disabled="!formData.remotePreset.url || !remotePresetValid"
          :loading-secondary="remotePresetValid === null"
          icon-left="done"
          class="primary"
          @click="closeRemotePresetModal()"
        />
      </div>
    </VueModal>

    <VueModal
      v-if="showCancel"
      :title="$t('org.vue.views.project-create.tabs.details.modal.title')"
      class="small"
      @close="showCancel = false"
    >
      <div class="default-body">
        {{ $t('org.vue.views.project-create.tabs.details.modal.body') }}
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          :label="$t('org.vue.views.project-create.tabs.details.modal.buttons.back')"
          class="flat"
          @click="showCancel = false"
        />

        <VueButton
          :to="{ name: 'project-select' }"
          :label="$t('org.vue.views.project-create.tabs.details.modal.buttons.clear')"
          icon-left="delete_forever"
          class="danger"
        />
      </div>
    </VueModal>

    <VueModal
      v-if="showSavePreset"
      :title="$t('org.vue.views.project-create.tabs.configuration.modal.title')"
      class="medium save-preset-modal"
      @close="showSavePreset = false"
    >
      <div class="default-body">
        <VueFormField
          :title="$t('org.vue.views.project-create.tabs.configuration.modal.body.title')"
          :subtitle="$t('org.vue.views.project-create.tabs.configuration.modal.body.subtitle')"
        >
          <VueInput
            v-model="formData.save"
            icon-left="local_offer"
            v-focus
          />
        </VueFormField>
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          :label="$t('org.vue.views.project-create.tabs.configuration.modal.buttons.cancel')"
          class="flat close"
          @click="showSavePreset = false"
        />

        <VueButton
          :label="$t('org.vue.views.project-create.tabs.configuration.modal.buttons.continue')"
          class="continue"
          @click="createWithoutSaving()"
        />

        <VueButton
          :label="$t('org.vue.views.project-create.tabs.configuration.modal.buttons.create')"
          icon-left="save"
          class="primary save"
          :disabled="!formData.save"
          @click="createProject()"
        />
      </div>
    </VueModal>

    <ProgressScreen
      progress-id="project-create"
      :debug="debug"
    />
  </div>
</template>

<script>
import Prompts from '@/mixins/Prompts'
import { isValidName } from '@/util/folders'
import debounce from 'lodash.debounce'

import CWD from '@/graphql/cwd/cwd.gql'
import PROJECT_CREATION from '@/graphql/project/projectCreation.gql'
import FEATURE_SET_ENABLED from '@/graphql/feature/featureSetEnabled.gql'
import PRESET_APPLY from '@/graphql/preset/presetApply.gql'
import PROJECT_CREATE from '@/graphql/project/projectCreate.gql'
import PROJECT_CANCEL_CREATION from '@/graphql/project/projectCancelCreation.gql'

function formDataFactory () {
  return {
    folder: '',
    force: false,
    enableGit: true,
    gitCommitMessage: '',
    packageManager: undefined,
    selectedPreset: null,
    remotePreset: {
      url: '',
      clone: false
    },
    save: ''
  }
}

let formData = formDataFactory()

export default {
  name: 'ProjectCreate',

  mixins: [
    Prompts({
      field: 'projectCreation',
      query: PROJECT_CREATION
    })
  ],

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-create.title')
    }
  },

  data () {
    return {
      formData: formData,
      cwd: '',
      projectCreation: null,
      showCancel: false,
      showRemotePreset: false,
      showSavePreset: false,
      remotePresetValid: false,
      debug: ''
    }
  },

  apollo: {
    cwd: {
      query: CWD,
      fetchPolicy: 'network-only'
    },

    projectCreation: {
      query: PROJECT_CREATION,
      fetchPolicy: 'network-only'
    }
  },

  computed: {
    folderNameValid () {
      return isValidName(this.formData.folder)
    },

    detailsValid () {
      return !!this.formData.folder && this.folderNameValid
    },

    presetValid () {
      return !!this.formData.selectedPreset
    },

    manual () {
      return this.formData.selectedPreset === '__manual__'
    },

    remotePresetInfo () {
      return {
        name: 'org.vue.views.project-create.tabs.presets.remote.name',
        description: 'org.vue.views.project-create.tabs.presets.remote.description'
      }
    },

    remoteNotGithub () {
      const { url } = this.formData.remotePreset
      return url && /^(gitlab|bitbucket):/.test(url)
    }
  },

  watch: {
    'formData.remotePreset.url' () {
      this.debouncedCheckRemotePreset()
    },

    'formData.remotePreset.clone' () {
      this.debouncedCheckRemotePreset()
    },

    remoteNotGithub (value) {
      if (value) {
        this.$_oldClone = this.formData.remotePreset.clone
        this.formData.remotePreset.clone = value
      } else {
        this.formData.remotePreset.clone = this.$_oldClone
      }

      if (!value) {
        this.checkRemotePreset()
      }
    }
  },

  created () {
    this.debouncedCheckRemotePreset = debounce(this.checkRemotePreset, 1000)
  },

  beforeDestroy () {
    this.cancel()
  },

  methods: {
    async selectPreset (id) {
      this.formData.selectedPreset = id

      if (id === '__remote__') {
        this.showRemotePreset = true
        return
      }

      await this.$apollo.mutate({
        mutation: PRESET_APPLY,
        variables: {
          id
        },
        update: (store, { data: { presetApply } }) => {
          store.writeQuery({ query: PROJECT_CREATION, data: { projectCreation: presetApply } })
        }
      })
    },

    async toggleFeature (feature) {
      await this.$apollo.mutate({
        mutation: FEATURE_SET_ENABLED,
        variables: {
          id: feature.id,
          enabled: !feature.enabled
        }
      })

      this.$apollo.queries.projectCreation.refetch()
    },

    createWithoutSaving () {
      this.formData.save = ''
      this.createProject()
    },

    async createProject () {
      this.showSavePreset = false

      try {
        await this.$apollo.mutate({
          mutation: PROJECT_CREATE,
          variables: {
            input: {
              folder: this.formData.folder,
              force: this.formData.force,
              enableGit: this.formData.enableGit,
              gitCommitMessage: this.formData.gitCommitMessage,
              packageManager: this.formData.packageManager,
              preset: this.formData.selectedPreset,
              remote: this.formData.remotePreset.url,
              clone: this.formData.remotePreset.clone,
              save: this.formData.save
            }
          }
        })
        this.$router.push({ name: 'project-home' })
        await this.$nextTick()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        this.debug = `ERROR: ${e}`
      }
    },

    async cancel () {
      formData = formDataFactory()
      await this.$apollo.mutate({
        mutation: PROJECT_CANCEL_CREATION
      })
    },

    closeRemotePresetModal (clear = false) {
      if (clear) {
        this.formData.remotePreset.url = ''
      }

      this.showRemotePreset = false
      if (!this.formData.remotePreset.url) {
        this.formData.selectedPreset = null
      }
    },

    async checkRemotePreset () {
      if (!this.formData.remotePreset.url) {
        this.remotePresetValid = false
        return
      }

      if (this.formData.remotePreset.clone) {
        this.remotePresetValid = true
      } else {
        this.remotePresetValid = null

        const url = `https://raw.githubusercontent.com/${this.formData.remotePreset.url}/master/preset.json`

        const response = await fetch(url)
        this.remotePresetValid = response.ok
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-create
  display grid
  grid-template-columns 1fr
  grid-template-rows auto
  grid-template-areas "content"

.content
  grid-area content

.project-details
  max-width 400px
  width 100%
  margin 42px auto
  grid-gap ($padding-item * 3)

  .vue-ui-text.banner
    margin-top 6px

.project-path
  h-box()
  box-center()

  .path
    flex 100% 1 1
    margin-right 6px
    h-box()
    align-items baseline

    .folder
      font-weight bold
</style>
