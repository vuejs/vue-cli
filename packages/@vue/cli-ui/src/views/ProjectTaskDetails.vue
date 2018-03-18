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

    <div class="content">
      <TerminalView
        ref="terminal"
        :key="id"
        :cols="100"
        :rows="24"
        auto-size
        :options="{
          scrollback: 1000,
          disableStdin: true,
          useFlowControl: true
        }"
        :title="$t('views.project-task-details.output')"
        toolbar
        @clear="clearLogs()"
      />
    </div>
  </div>
</template>

<script>
import TASK from '../graphql/task.gql'
import TASK_LOGS from '../graphql/taskLogs.gql'
import TASK_RUN from '../graphql/taskRun.gql'
import TASK_STOP from '../graphql/taskStop.gql'
import TASK_LOGS_CLEAR from '../graphql/taskLogsClear.gql'
import TASK_LOG_ADDED from '../graphql/taskLogAdded.gql'

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
      task: null,
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
    },

    taskLogs: {
      query: TASK_LOGS,
      variables () {
        return {
          id: this.id
        }
      },
      fetchPolicy: 'network-only',
      manual: true,
      result ({ data, loading }) {
        if (!loading) {
          const terminal = this.$refs.terminal
          data.taskLogs.logs.forEach(terminal.addLog)
        }
      }
    },

    $subscribe: {
      taskLogAdded: {
        query: TASK_LOG_ADDED,
        variables () {
          return {
            id: this.id
          }
        },
        result ({ data }) {
          if (data.taskLogAdded.taskId === this.id) {
            const terminal = this.$refs.terminal
            terminal.addLog(data.taskLogAdded)
          }
        }
      }
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
    },

    clearLogs () {
      this.$apollo.mutate({
        mutation: TASK_LOGS_CLEAR,
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

.project-task-details
  v-box()
  align-items stretch
  height 100%

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

  .content
    flex 100% 1 1
    height 0
    padding 0 $padding-item $padding-item

  .terminal-view
    height 100%
    border-radius $br
</style>
