<template>
  <div class="project-plugins page">
    <ContentView
      title="Project plugins"
    >
      <template slot="header">
        <VueButton
          icon-left="add"
          label="Add plugin"
          class="primary"
        />
      </template>

      <ApolloQuery
        :query="require('../graphql/projectPlugins.gql')"
        fetch-policy="cache-and-network"
      >
        <template slot-scope="{ result: { data, loading } }">
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
  </div>
</template>

<script>
export default {
  name: 'ProjectPlugins'
}
</script>
