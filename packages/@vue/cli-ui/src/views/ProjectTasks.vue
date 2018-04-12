<template>
  <div class="project-tasks page">
    <ContentView
      :title="$t('views.project-tasks.title')"
    >
      <ApolloQuery
        :query="require('../graphql/tasks.gql')"
        fetch-policy="cache-and-network"
        class="fill-height"
      >
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator
            v-if="loading"
            class="overlay"
          />

          <NavContent
            v-else-if="data"
            :items="generateItems(data.tasks)"
            class="tasks"
          >
            <TaskItem
              slot-scope="{ item, selected }"
              :task="item.task"
              :selected="selected"
            />
          </NavContent>
        </template>
      </ApolloQuery>
    </ContentView>
  </div>
</template>

<script>
import RestoreRoute from '../mixins/RestoreRoute'

import TASK_CHANGED from '../graphql/taskChanged.gql'

export default {
  mixins: [
    RestoreRoute()
  ],

  metaInfo () {
    return {
      title: this.$t('views.project-tasks.title')
    }
  },

  apollo: {
    $subscribe: {
      taskChanged: {
        query: TASK_CHANGED
      }
    }
  },

  methods: {
    generateItems (tasks) {
      return tasks.map(
        task => ({
          route: {
            name: 'project-task-details',
            params: {
              id: task.id
            }
          },
          task
        })
      )
    }
  }
}
</script>
