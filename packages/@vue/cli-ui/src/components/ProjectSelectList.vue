<template>
  <div class="project-select-list">
    <ApolloQuery
      :query="require('@/graphql/projects.gql')"
    >
      <template slot-scope="{ result: { data } }">
        <template v-if="data">
          <div v-if="data.projects.length">
            TODO
          </div>
          <div v-else class="vue-empty">
            <VueIcon icon="attach_file" class="empty-icon"/>
            <div>No existing projects</div>
          </div>
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>
