<template>
  <div class="widget-add-pane">
    <div class="pane-toolbar">
      <VueIcon
        icon="library_add"
      />
      <div class="title">
        {{ $t('org.vue.components.widget-add-pane.title') }}
      </div>
      <VueButton
        class="icon-button flat"
        icon-left="close"
        v-tooltip="$t('org.vue.common.close')"
        @click="close()"
      />
    </div>

    <div class="toolbar">
      <VueInput
        v-model="search"
        icon-left="search"
        class="round search-input"
      />
    </div>

    <ApolloQuery
      :query="require('@/graphql/widget/widgetDefinitions.gql')"
      class="widgets"
    >
      <template slot-scope="{ result: { data, loading } }">
        <VueLoadingIndicator
          v-if="loading && (!data || !data.widgets)"
          class="overlay"
        />

        <template v-else-if="data">
          <template v-for="definition of data.widgetDefinitions.filter(filterDefinition)">
            <WidgetAddItem
              v-if="definition.canAddMore"
              :key="definition.id"
              :definition="definition"
            />
          </template>
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
export default {
  data () {
    return {
      search: ''
    }
  },

  methods: {
    close () {
      this.$emit('close')
    },

    filterDefinition (def) {
      if (!this.search) return true

      const reg = new RegExp(this.search.replace(/\s+/g, '|'), 'i')
      return def.title.match(reg) ||
        (def.description && def.description.match(reg)) ||
        (def.longDescription && def.longDescription.match(reg))
    }
  }
}
</script>

<style lang="stylus" scoped>
.widget-add-pane
  position relative
  z-index 1
  v-box()
  box-shadow 0 0 10px rgba(black, .1)
  background $vue-ui-color-light
  .vue-ui-dark-mode &
    background $vue-ui-color-darker

.toolbar
  h-box()
  box-center()
  margin $padding-item

.search-input
  width 100%

.widgets
  flex 1
  overflow-x hidden
  overflow-y auto
</style>
