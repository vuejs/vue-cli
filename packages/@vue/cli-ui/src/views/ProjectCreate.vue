<template>
  <div class="project-create page">
    <div class="content">
      <StepWizard
        ref="wizard"
        title="Create a new project"
      >
        <VueTab
          id="details"
          label="Details"
          icon="subject"
        >
          <div class="content">
            <div class="project-details vue-grid col-1 big-gap">
              <VueFormField
                title="Project folder"
              >
                <VueInput
                  v-model="folder"
                  placeholder="my-app"
                  icon-left="folder"
                  class="big"
                />

                <VueButton
                  label="Change current working directory"
                  :to="{ name: 'project-select', query: { tab: 'create' } }"
                />
              </VueFormField>

              <VueFormField
                title="Package manager"
              >
                <VueSelect
                  v-model="packageManager"
                >
                  <VueSelectButton
                    :value="undefined"
                    label="Default"
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
                title="Additional options"
              >
                <VueSwitch
                  v-model="force"
                  class="extend-left"
                >
                  Overwrite target directory if it exists
                </VueSwitch>
              </VueFormField>
            </div>
          </div>

          <div class="actions-bar">
            <VueButton
              :to="{ name: 'project-select' }"
              icon-left="close"
              label="Cancel"
              class="big"
            />

            <VueButton
              icon-right="arrow_forward"
              label="Next"
              class="big primary"
              :disabled="!detailsValid"
              @click="$refs.wizard.next()"
            />
          </div>
        </VueTab>

        <VueTab
          id="presets"
          label="Presets"
          icon="check_circle"
          :disabled="!detailsValid"
        >
          <div class="content">

          </div>

          <div class="actions-bar">
            <VueButton
              icon-left="arrow_back"
              label="Previous"
              class="big"
              @click="$refs.wizard.previous()"
            />

            <VueButton
              icon-right="arrow_forward"
              label="Next"
              class="big primary"
              @click="$refs.wizard.next()"
            />
          </div>
        </VueTab>

        <VueTab
          id="features"
          label="Features"
          icon="widgets"
          :disabled="!detailsValid"
        >
          <div class="content">

          </div>

          <div class="actions-bar">
            <VueButton
              icon-left="arrow_back"
              label="Previous"
              class="big"
              @click="$refs.wizard.previous()"
            />

            <VueButton
              icon-right="arrow_forward"
              label="Next"
              class="big primary"
              @click="$refs.wizard.next()"
            />
          </div>
        </VueTab>

        <VueTab
          id="config"
          label="Configuration"
          icon="settings_applications"
          :disabled="!detailsValid"
        >
          <div class="content">

          </div>

          <div class="actions-bar">
            <VueButton
              icon-left="arrow_back"
              label="Previous"
              class="big"
              @click="$refs.wizard.previous()"
            />

            <VueButton
              icon-left="done"
              label="Create project"
              class="big primary"
            />
          </div>
        </VueTab>
      </StepWizard>
    </div>

    <StatusBar cwd/>
  </div>
</template>

<script>
import StepWizard from '../components/StepWizard'
import StatusBar from '../components/StatusBar'

export default {
  components: {
    StepWizard,
    StatusBar
  },

  data () {
    return {
      folder: '',
      force: false,
      packageManager: undefined
    }
  },

  computed: {
    detailsValid () {
      return !!this.folder
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-create
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 28px
  grid-template-areas "content" "footer"

.content
  grid-area content

.status-bar
  grid-area footer

.project-details
  max-width 400px
  width 100%
  margin 42px auto
</style>
