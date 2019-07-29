<template>
  <VueModal
    :title="$t('org.vue.components.project-rename.title')"
    class="medium anchor"
    @close="$emit('close')"
  >
    <div class="default-body">
      <VueFormField
        :title="$t('org.vue.components.project-rename.name-field.title')"
        :subtitle="$t('org.vue.components.project-rename.name-field.subtitle')"
      >
        <VueInput
          v-model="newName"
          icon-left="folder"
          v-focus
          class="big"
          @keyup.enter="rename()"
        />
      </VueFormField>
    </div>

    <div slot="footer" class="actions">
      <VueButton
        :label="$t('org.vue.common.cancel')"
        class="flat big close"
        @click="$emit('close')"
      />

      <VueButton
        class="primary big"
        :label="$t('org.vue.components.project-rename.submit')"
        @click="rename()"
      />
    </div>
  </VueModal>
</template>

<script>
import gql from 'graphql-tag'

export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      newName: this.project.name,
      loading: false
    }
  },

  methods: {
    async rename () {
      this.loading = true

      await this.$apollo.mutate({
        mutation: gql`
          mutation renameProject ($id: ID!, $name: String!) {
            projectRename (id: $id, name: $name) {
              id
              name
            }
          }
        `,
        variables: {
          id: this.project.id,
          name: this.newName
        }
      })

      this.$emit('close')
    }
  }
}
</script>
