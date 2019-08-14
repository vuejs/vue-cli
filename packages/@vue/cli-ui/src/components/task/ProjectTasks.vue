<template>
  <div class="project-tasks page">
    <ContentView
      :title="$t('org.vue.views.project-tasks.title')"
    >
      <ApolloQuery
        ref="tasks"
        :query="require('@/graphql/task/tasks.gql')"
        class="fill-height"
      >
        <template slot-scope="{ result: { data, loading } }">
          <VueLoadingIndicator
            v-if="loading && (!data || !data.tasks)"
            class="overlay"
          />

          <NavContent
            v-else-if="data"
            :items="generateItems(data.tasks)"
            class="tasks"
          >
            <div
              slot="before"
              class="list-header"
            >
              <VueInput
                v-model="search"
                icon-left="search"
                class="search round"
              />

              <VueButton
                v-tooltip="$t('org.vue.views.project-tasks.refresh')"
                icon-left="refresh"
                class="icon-button flat"
                @click="refresh()"
              />
            </div>

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
import RestoreRoute from '@/mixins/RestoreRoute'

import TASK_CHANGED from '@/graphql/task/taskChanged.gql'
import TASKS from '@/graphql/task/tasks.gql'

export default {
  mixins: [
    RestoreRoute({
      baseRoute: { name: 'project-tasks' }
    })
  ],

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-tasks.title')
    }
  },

  data () {
    return {
      search: ''
    }
  },

  apollo: {
    $subscribe: {
      taskChanged: {
        query: TASK_CHANGED
      }
    }
  },

  bus: {
    quickOpenProject (project) {
      this.$apollo.getClient().writeQuery({
        query: TASKS,
        data: {
          tasks: null
        }
      })
    }
  },

  methods: {
    generateItems (tasks) {
      if (!tasks) return []
      return tasks.filter(
        item => !this.search || item.name.includes(this.search)
      ).map(
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
    },

    refresh () {
      this.$refs.tasks.$apollo.queries.query.refetch()
    }
  }
}
</script>

<style lang="stylus" scoped>
.search
  margin-right 6px
</style>
