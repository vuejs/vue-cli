<template>
  <div class="project-create page">
    <div class="content">
      <StepWizard
        :title="$t('views.project-create.title')"
        class="frame"
      >
        <template slot-scope="{ next, previous }">
          <VueTab
            id="details"
            :label="$t('views.project-create.tabs.details.title')"
            icon="subject"
          >
            <div class="content vue-ui-disable-scroll">
              <div class="project-details vue-ui-grid col-1 big-gap">
                <VueFormField
                  :title="$t('views.project-create.tabs.details.form.folder.label')"
                >
                  <VueInput
                    v-model="formData.folder"
                    :placeholder="$t('views.project-create.tabs.details.form.folder.placeholder')"
                    icon-left="folder"
                    class="big"
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
                        class="icon-button"
                        v-tooltip="$t('views.project-create.tabs.details.form.folder.tooltip')"
                        :to="{
                          name: 'project-select',
                          query: {
                            title: $t('views.project-create.title'),
                            tab: 'create',
                            hideTabs: true,
                            action: $t('views.project-create.tabs.details.form.folder.action')
                          }
                        }"
                      />
                    </div>
                  </div>
                </VueFormField>

                <VueFormField
                  :title="$t('views.project-create.tabs.details.form.manager.label')"
                >
                  <VueSelect
                    v-model="formData.packageManager"
                  >
                    <VueSelectButton
                      :value="undefined"
                      :label="$t('views.project-create.tabs.details.form.manager.default')"
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
                  :title="$t('views.project-create.tabs.details.form.options.label')"
                >
                  <VueSwitch
                    v-model="formData.force"
                    class="extend-left"
                  >
                    {{ $t('views.project-create.tabs.details.form.options.description') }}
                  </VueSwitch>
                </VueFormField>
              </div>
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="close"
                :label="$t('views.project-create.tabs.details.buttons.cancel')"
                class="big"
                @click="showCancel = true"
              />

              <VueButton
                icon-right="arrow_forward"
                :label="$t('views.project-create.tabs.details.buttons.next')"
                class="big primary"
                :disabled="!detailsValid"
                @click="next()"
              />
            </div>
          </VueTab>

          <VueTab
            id="presets"
            :label="$t('views.project-create.tabs.presets.title')"
            icon="check_circle"
            :disabled="!detailsValid"
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <div class="vue-ui-text info banner">
                <VueIcon icon="info" class="big"/>
                <span>{{ $t('views.project-create.tabs.presets.description') }}</span>
              </div>

              <div class="cta-text">
                {{ $t('views.project-create.tabs.presets.select') }}
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
                :selected="formData.selectedPreset === 'remote'"
                @click.native="selectPreset('remote')"
              />
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                :label="$t('views.project-create.tabs.presets.buttons.previous')"
                class="big"
                @click="previous()"
              />

              <VueButton
                v-if="manual"
                icon-right="arrow_forward"
                :label="$t('views.project-create.tabs.presets.buttons.next')"
                class="big primary"
                :disabled="!presetValid"
                @click="next()"
              />
              <VueButton
                v-else
                icon-left="done"
                :label="$t('views.project-create.tabs.presets.buttons.create')"
                class="big primary"
                @click="createWithoutSaving()"
              />
            </div>
          </VueTab>

          <VueTab
            id="features"
            :label="$t('views.project-create.tabs.features.title')"
            icon="device_hub"
            :disabled="!detailsValid || !presetValid || !manual"
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <div class="vue-ui-text info banner">
                <VueIcon icon="info" class="big"/>
                <span>{{ $t('views.project-create.tabs.features.description') }}</span>
              </div>

              <div class="cta-text">
                {{ $t('views.project-create.tabs.features.enable') }}
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
                :label="$t('views.project-create.tabs.features.buttons.previous')"
                class="big"
                @click="previous()"
              />

              <VueButton
                v-if="enabledPrompts.length"
                icon-right="arrow_forward"
                :label="$t('views.project-create.tabs.features.buttons.next')"
                class="big primary"
                @click="next()"
              />
              <VueButton
                v-else
                icon-left="done"
                :label="$t('views.project-create.tabs.features.buttons.create')"
                class="big primary"
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
            :label="$t('views.project-create.tabs.configuration.title')"
            icon="settings_applications"
            :disabled="!detailsValid || !presetValid || !manual || !enabledPrompts.length"
            lazy
          >
            <div class="content vue-ui-disable-scroll">
              <PromptsList
                :prompts="enabledPrompts"
                @answer="answerPrompt"
              />
            </div>

            <div class="actions-bar">
              <VueButton
                icon-left="arrow_back"
                :label="$t('views.project-create.tabs.configuration.buttons.previous')"
                class="big"
                @click="previous()"
              />

              <VueButton
                icon-left="done"
                :label="$t('views.project-create.tabs.configuration.buttons.create')"
                class="big primary"
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
      :title="$t('views.project-create.tabs.presets.modal.title')"
      class="medium"
      @close="showRemotePreset = false"
    >
      <div class="default-body">
        <div class="vue-ui-empty">
          <VueIcon icon="cake" class="large"/>
          <div>
            {{ $t('views.project-create.tabs.presets.modal.body') }}
          </div>
        </div>
      </div>
    </VueModal>

    <VueModal
      v-if="showCancel"
      :title="$t('views.project-create.tabs.details.modal.title')"
      class="small"
      @close="showCancel = false"
    >
      <div class="default-body">
        {{ $t('views.project-create.tabs.details.modal.body') }}
      </div>

      <div slot="footer" class="actions space-between">
        <VueButton
          :label="$t('views.project-create.tabs.details.modal.buttons.back')"
          class="flat"
          @click="showCancel = false"
        />

        <VueButton
          :to="{ name: 'project-select' }"
          :label="$t('views.project-create.tabs.details.modal.buttons.clear')"
          icon-left="delete_forever"
          class="danger"
          @click="reset()"
        />
      </div>
    </VueModal>

    <VueModal
      v-if="showSavePreset"
      :title="$t('views.project-create.tabs.configuration.modal.title')"
      class="medium"
      @close="showSavePreset = false"
    >
      <div class="default-body">
        <VueFormField
          :title="$t('views.project-create.tabs.configuration.modal.body.title')"
          :subtitle="$t('views.project-create.tabs.configuration.modal.body.subtitle')"
        >
          <VueInput
            v-model="formData.save"
            icon-left="local_offer"
          />
        </VueFormField>
      </div>

      <div slot="footer" class="actions end">
        <VueButton
          :label="$t('views.project-create.tabs.configuration.modal.buttons.cancel')"
          class="flat"
          @click="showSavePreset = false"
        />

        <div class="vue-ui-spacer"/>

        <VueButton
          :label="$t('views.project-create.tabs.configuration.modal.buttons.continue')"
          class="flat"
          @click="createWithoutSaving()"
        />

        <VueButton
          :label="$t('views.project-create.tabs.configuration.modal.buttons.create')"
          icon-left="save"
          class="primary"
          :disabled="!formData.save"
          @click="createProject()"
        />
      </div>
    </VueModal>

    <ProgressScreen
      progress-id="project-create"
    />
  </div>
</template>

<script>
import Prompts from '../mixins/Prompts'

import CWD from '../graphql/cwd.gql'
import PROJECT_CREATION from '../graphql/projectCreation.gql'
import FEATURE_SET_ENABLED from '../graphql/featureSetEnabled.gql'
import PRESET_APPLY from '../graphql/presetApply.gql'
import PROJECT_CREATE from '../graphql/projectCreate.gql'

function formDataFactory () {
  return {
    folder: '',
    force: false,
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

  data () {
    return {
      formData: formData,
      cwd: '',
      projectCreation: null,
      showCancel: false,
      showRemotePreset: false,
      showSavePreset: false
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
    detailsValid () {
      return !!this.formData.folder
    },

    presetValid () {
      return !!this.formData.selectedPreset
    },

    manual () {
      return this.formData.selectedPreset === '__manual__'
    },

    remotePresetInfo () {
      return {
        name: 'Remote preset',
        description: 'Fetch a preset from a git repository'
      }
    }
  },

  methods: {
    reset () {
      formData = formDataFactory()
    },

    async selectPreset (id) {
      if (id === 'remote') {
        this.showRemotePreset = true
        return
      }

      this.formData.selectedPreset = id

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
              packageManager: this.formData.packageManager,
              preset: this.formData.selectedPreset,
              remote: this.formData.remotePreset.url,
              clone: this.formData.remotePreset.clone,
              save: this.formData.save
            }
          }
        })
        this.$router.push({ name: 'project-home' })
        this.reset()
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

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
