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
          <WidgetAddItem
            v-for="definition of data.widgetDefinitions"
            v-if="definition.canAddMore"
            :key="definition.id"
            :definition="definition"
          />
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
export default {
  data () {
    return {
      search: '' // TODO
    }
  },

  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.widget-add-pane
  position relative
  z-index 1
  box-shadow 0 0 10px rgba(black, .1)
  v-box()

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
