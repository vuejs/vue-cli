<template>
  <div class="widget-add-item list-item">
    <div
      class="info"
      @click="showDetails = true"
    >
      <ItemLogo
        :image="definition.icon"
        fallback-icon="widgets"
      />
      <ListItemInfo
        :name="$t(definition.title)"
        :description="$t(definition.description)"
        :link="definition.link"
      />
    </div>

    <div class="actions">
      <VueButton
        class="primary icon-button"
        v-tooltip="$t('org.vue.components.widget-add-item.add')"
        icon-left="add"
        @click="add()"
      />
    </div>

    <VueModal
      v-if="showDetails"
      :title="$t('org.vue.components.widget-add-item.details.title')"
      class="medium"
      @close="showDetails = false"
    >
      <div class="custom-body">
        <div class="details">
          <ItemLogo
            :image="definition.icon"
            fallback-icon="widgets"
          />
          <ListItemInfo
            :name="$t(definition.title)"
            :description="$t(definition.description)"
          />
        </div>

        <div v-if="definition.longDescription" class="details">
          <div
            class="description"
            v-html="$t(definition.longDescription)"
          />
        </div>

        <div class="instances">
          {{ $t('org.vue.components.widget-add-item.details.max-instances', {
            count: definition.count,
            total: definition.maxCount == null ? $t('org.vue.components.widget-add-item.details.unlimited') : definition.maxCount
          }) }}
        </div>
      </div>

      <div slot="footer" class="actions">
        <VueButton
          v-if="definition.link"
          :href="definition.link"
          :label="$t('org.vue.common.more-info')"
          target="_blank"
          class="flat"
          icon-right="open_in_new"
        />

        <VueButton
          class="primary"
          :label="$t('org.vue.components.widget-add-item.add')"
          icon-left="add"
          @click="add()"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import WIDGET_ADD from '@/graphql/widget/widgetAdd.gql'
import WIDGETS from '@/graphql/widget/widgets.gql'
import WIDGET_DEFINITION_FRAGMENT from '@/graphql/widget/widgetDefinitionFragment.gql'

export default {
  props: {
    definition: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      showDetails: false
    }
  },

  methods: {
    add () {
      this.showDetails = false
      this.$apollo.mutate({
        mutation: WIDGET_ADD,
        variables: {
          input: {
            definitionId: this.definition.id
          }
        },
        update: (store, { data: { widgetAdd } }) => {
          let data = store.readQuery({ query: WIDGETS })
          // TODO this is a workaround
          // See: https://github.com/apollographql/apollo-client/issues/4031#issuecomment-433668473
          data = {
            widgets: [...data.widgets, widgetAdd]
          }
          store.writeQuery({ query: WIDGETS, data })
          store.writeFragment({
            fragment: WIDGET_DEFINITION_FRAGMENT,
            id: widgetAdd.definition.id,
            data: widgetAdd.definition
          })
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.widget-add-item
  .actions
    margin-right $padding-item

  &,
  .actions
    h-box()
    box-center()

  .info
    flex 1
    overflow hidden
    padding $padding-item
    h-box()

    .list-item-info
      flex 1
      overflow hidden

      >>> .description
        flex 1
        ellipsis()

// Modal

.custom-body
  padding 0 24px $padding-item

  .details
    display flex
    margin-bottom $padding-item
</style>
