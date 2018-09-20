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
        class="primary"
        :label="$t('org.vue.components.widget-add-item.add')"
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
      <div class="default-body">
        TODO
      </div>

      <div slot="footer" class="actions">
        <VueButton
          class="primary big"
          :label="$t('org.vue.components.widget-add-item.add')"
          icon-left="add"
          @click="add()"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import WIDGET_ADD from '../graphql/widgetAdd.gql'
import WIDGETS from '../graphql/widgets.gql'
import WIDGET_DEFINITION_FRAGMENT from '../graphql/widgetDefinitionFragment.gql'

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
          const data = store.readQuery({ query: WIDGETS })
          data.widgets.push(widgetAdd)
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
@import "~@/style/imports"

.widget-add-item
  padding $padding-item

.info
  h-box()

  .list-item-info
    flex 1

.actions
  h-box()
  box-center()
  margin-top $padding-item
</style>
