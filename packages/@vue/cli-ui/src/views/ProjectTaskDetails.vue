<template>
  <div class="project-task-details">
    <div v-if="task" class="actions-bar">
      <VueButton
        v-if="task.status !== 'running'"
        icon-left="play_arrow"
        class="primary"
        :label="$t('views.project-task-details.actions.play')"
        @click="runTask()"
      />
      <VueButton
        v-else
        icon-left="stop"
        class="primary"
        :label="$t('views.project-task-details.actions.stop')"
        @click="stopTask()"
      />

      <div
        class="command"
        v-tooltip="$t('views.project-task-details.command')"
      >
        {{ task.command }}
      </div>

      <div class="vue-ui-spacer"/>
    </div>
  </div>
</template>

<script>
import TASK from '../graphql/task.gql'
import TASK_RUN from '../graphql/taskRun.gql'
import TASK_STOP from '../graphql/taskStop.gql'

export default {
  name: 'ProjectTaskDetails',

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      task: null
    }
  },

  apollo: {
    task: {
      query: TASK,
      variables () {
        return {
          id: this.id
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  },

  methods: {
    runTask () {
      this.$apollo.mutate({
        mutation: TASK_RUN,
        variables: {
          id: this.id
        }
      })
    },

    stopTask () {
      this.$apollo.mutate({
        mutation: TASK_STOP,
        variables: {
          id: this.id
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.command
  font-family 'Roboto Mono', monospace
  font-size 12px
  background lighten($vue-ui-color-dark, 40%)
  color $vue-ui-color-light
  padding 0 16px
  height 32px
  h-box()
  box-center()
  border-radius $br
</style>
