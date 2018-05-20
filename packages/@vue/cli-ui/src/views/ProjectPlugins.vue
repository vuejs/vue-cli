<template>
  <div class="project-plugins page">
    <ContentView
      :title="$t('views.project-plugins.title')"
      class="limit-width"
    >
      <template slot="header">
        <VueButton
          icon-left="add"
          :label="$t('views.project-plugins.button')"
          class="primary"
          :to="{ name: 'project-plugins-add' }"
          data-testid="add-plugin"
        />
      </template>

      <ApolloQuery
        :query="require('../graphql/projectPlugins.gql')"
        fetch-policy="cache-and-network"
      >
        <template slot-scope="{ result: { data, loading } }">
          <div class="cta-text">{{ $t('views.project-plugins.heading') }}</div>

          <VueLoadingIndicator
            v-if="loading"
            class="overlay"
          />

          <div v-else-if="data" class="plugins">
            <ProjectPluginItem
              v-for="plugin of data.projectCurrent.plugins"
              :key="plugin.id"
              :plugin="plugin"
            />
          </div>
        </template>
      </ApolloQuery>
    </ContentView>

    <ProgressScreen
      progress-id="plugin-update"
    />
  </div>
</template>

<script>
export default {
  name: 'ProjectPlugins',

  metaInfo () {
    return {
      title: this.$t('views.project-plugins.title')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.project-plugins
  .content-view /deep/ > .content
    overflow-y auto
</style>
