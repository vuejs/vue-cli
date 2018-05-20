<template>
  <div class="project-task-details">
    <template v-if="task">
      <div class="header">
        <VueIcon icon="assignment" class="task-icon big"/>
        <div class="name">{{ task.name }}</div>
        <div class="description">{{ $t(task.description) }}</div>
      </div>

      <div class="actions-bar">
        <VueButton
          v-if="task.status !== 'running'"
          icon-left="play_arrow"
          class="primary"
          :label="$t('views.project-task-details.actions.play')"
          data-testid="run-task"
          @click="runTask()"
        />
        <VueButton
          v-else
          icon-left="stop"
          class="primary"
          :label="$t('views.project-task-details.actions.stop')"
          data-testid="stop-task"
          @click="stopTask()"
        />

        <VueButton
          v-if="task.prompts.length"
          icon-left="settings"
          class="icon-button primary"
          :disabled="task.status === 'running'"
          v-tooltip="$t('views.project-task-details.parameters')"
          @click="showParameters = true"
        />

        <div
          class="command"
          v-tooltip="$t('views.project-task-details.command')"
        >
          {{ task.command }}
        </div>

        <VueButton
          v-if="task.link"
          :href="task.link"
          target="_blank"
          icon-left="open_in_new"
          class="icon-button"
          v-tooltip="$t('views.project-task-details.more-info')"
        />

        <div class="vue-ui-spacer"/>

        <VueGroup
          v-if="task.views.length"
          v-model="currentView"
          class="views"
        >
          <VueGroupButton
            :label="$t('views.project-task-details.output')"
            icon-left="dvr"
            value="_output"
          />

          <VueGroupButton
            v-for="view of task.views"
            :key="view.id"
            :value="view.id"
            :icon-left="view.icon"
            :label="$t(view.label)"
          />
        </VueGroup>
      </div>

      <div class="content">
        <TerminalView
          ref="terminal"
          :class="{
            ghost: currentView !== '_output'
          }"
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
          open-links
          @clear="clearLogs()"
        />

        <ClientAddonComponent
          v-if="currentView !== '_output'"
          :name="currentViewComponent"
          :key="currentView"
          class="view"
        />
      </div>
    </template>

    <VueModal
      v-if="showParameters"
      :title="$t('views.project-task-details.parameters')"
      class="medium"
      @close="showParameters = false"
    >
      <div class="default-body">
        <PromptsList
          :prompts="visiblePrompts"
          @answer="answerPrompt"
        />

        <div class="vue-ui-text info banner">
          <VueIcon icon="info" class="big"/>
          <span>{{ $t('views.project-task-details.parameters-info') }}</span>
        </div>
      </div>

      <div slot="footer" class="actions">
        <VueButton
          class="primary big"
          :label="$t('views.project-task-details.actions.close')"
          @click="showParameters = false"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import Prompts from '../mixins/Prompts'

import TASK from '../graphql/task.gql'
import TASK_LOGS from '../graphql/taskLogs.gql'
import TASK_RUN from '../graphql/taskRun.gql'
import TASK_STOP from '../graphql/taskStop.gql'
import TASK_LOGS_CLEAR from '../graphql/taskLogsClear.gql'
import TASK_LOG_ADDED from '../graphql/taskLogAdded.gql'

export default {
  name: 'ProjectTaskDetails',

  provide () {
    return {
      TaskDetails: this
    }
  },

  mixins: [
    Prompts({
      field: 'task',
      query: TASK
    })
  ],

  metaInfo () {
    return {
      title: this.task && `${this.task.name} - ${this.$t('views.project-tasks.title')}`
    }
  },

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      task: null,
      showParameters: false,
      currentView: '_output'
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
      fetchPolicy: 'cache-and-network',
      async result ({ data, loading }) {
        if (!this.$_init && !loading && data && data.task && data.task.defaultView) {
          this.$_init = true
          await this.$nextTick()
          this.currentView = data.task.defaultView
        }
      }
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
      async result ({ data, loading }) {
        if (!loading) {
          await this.$nextTick()
          const terminal = this.$refs.terminal
          if (terminal) {
            data.taskLogs.logs.forEach(terminal.addLog)
          }
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
        async result ({ data }) {
          if (data.taskLogAdded.taskId === this.id) {
            await this.$nextTick()
            const terminal = this.$refs.terminal
            terminal.addLog(data.taskLogAdded)
          }
        }
      }
    }
  },

  computed: {
    currentViewComponent () {
      if (this.currentView !== '_output') {
        const id = this.task.views.find(
          view => view.id === this.currentView
        ).component
        return id
      }
    }
  },

  watch: {
    id () {
      this.showParameters = false
      this.currentView = '_output'
      this.$_init = false
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

@media (max-width: 1250px)
  .actions-bar
    flex-wrap wrap

  .views
    margin-top $padding-item

.command
  font-family $font-mono
  font-size 12px
  background $vue-ui-color-light-neutral
  color $vue-ui-color-dark
  padding 0 16px
  height 32px
  h-box()
  box-center()
  border-radius $br

.content
  flex auto 1 1
  height 0
  margin 0 $padding-item $padding-item
  position relative

.terminal-view
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  border-radius $br
  &.ghost
    opacity 0
    pointer-events none

.view
  max-height 100%
  overflow-x hidden
  overflow-y auto

.header
  padding $padding-item $padding-item 0
  h-box()
  align-items center

  .task-icon
    margin-right 4px
    >>> svg
      fill $vue-ui-color-dark

  .name
    font-size 22px
    color $vue-ui-color-dark
    position relative
    top -1px

  .description
    color $color-text-light
    margin-left $padding-item
</style>
