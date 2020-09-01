<template>
  <div class="project-task-details">
    <template v-if="task">
      <div class="header">
        <VueIcon icon="assignment" class="task-icon big"/>
        <div class="name">{{ task.name }}</div>
        <div
          class="description"
          v-tooltip="$t(task.description)"
        >
          {{ $t(task.description) }}
        </div>
        <div
          class="command"
          v-tooltip="`${$t('org.vue.views.project-task-details.command')}:<br><code>${task.command}</code>`"
        >
          {{ task.command }}
        </div>
      </div>

      <div class="actions-bar">
        <div class="main-actions">
          <VueButton
            v-if="task.status !== 'running'"
            icon-left="play_arrow"
            class="primary"
            :label="$t('org.vue.views.project-task-details.actions.play')"
            data-testid="run-task"
            @click="runTask()"
          />

          <VueButton
            v-else
            icon-left="stop"
            class="primary"
            :label="$t('org.vue.views.project-task-details.actions.stop')"
            data-testid="stop-task"
            @click="stopTask()"
          />

          <VueButton
            slot="trigger"
            icon-left="settings"
            :disabled="task.status === 'running'"
            :label="$t('org.vue.views.project-task-details.parameters')"
            @click="showParameters = true"
          />

          <VueButton
            v-if="task.link"
            :href="task.link"
            target="_blank"
            icon-left="open_in_new"
            class="icon-button"
            v-tooltip="$t('org.vue.views.project-task-details.more-info')"
          />
        </div>

        <VueGroup
          v-if="task.views.length"
          v-model="currentView"
          class="views"
        >
          <VueGroupButton
            :label="$t('org.vue.views.project-task-details.output')"
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

      <div v-if="!defer(3)" class="content placeholder-content">
        <div class="view card"/>
      </div>

      <div v-else class="content">
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
            scrollback: 5000,
            disableStdin: true,
            useFlowControl: true
          }"
          :title="$t('org.vue.views.project-task-details.output')"
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
      :title="$t('org.vue.views.project-task-details.parameters')"
      class="medium anchor"
      @close="restoreParameters()"
    >
      <div class="default-body">
        <PromptsList
          :prompts="visiblePrompts"
          @answer="answerPrompt"
        />
      </div>

      <div slot="footer" class="actions">
        <VueButton
          class="primary big"
          :label="$t('org.vue.views.project-task-details.actions.save')"
          @click="saveParameters()"
        />
      </div>
    </VueModal>
  </div>
</template>

<script>
import Prompts from '@/mixins/Prompts'
import Defer from '@/mixins/Defer'

import TASK from '@/graphql/task/task.gql'
import TASK_LOGS from '@/graphql/task/taskLogs.gql'
import TASK_RUN from '@/graphql/task/taskRun.gql'
import TASK_STOP from '@/graphql/task/taskStop.gql'
import TASK_LOGS_CLEAR from '@/graphql/task/taskLogsClear.gql'
import TASK_LOG_ADDED from '@/graphql/task/taskLogAdded.gql'
import TASK_OPEN from '@/graphql/task/taskOpen.gql'
import TASK_SAVE_PARAMETERS from '@/graphql/task/taskSaveParameters.gql'
import TASK_RESTORE_PARAMETERS from '@/graphql/task/taskRestoreParameters.gql'

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
    }),
    Defer()
  ],

  metaInfo () {
    return {
      title: this.task && `${this.task.name} - ${this.$t('org.vue.views.project-tasks.title')}`
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
      async result ({ data, loading }) {
        if (!this.$_init && !loading && data && data.task && data.task.defaultView) {
          this.$_init = true
          await this.$nextTick()
          this.currentView = data.task.defaultView
        }
      },
      skip () {
        return !this.defer(2)
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
      },
      skip () {
        return !this.defer(3)
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
        },
        skip () {
          return !this.defer(3)
        }
      }
    }
  },

  computed: {
    currentViewComponent () {
      if (this.currentView !== '_output') {
        const view = this.task.views.find(
          view => view.id === this.currentView
        )
        if (view) {
          const id = view.component
          return id
        }
      }
      return null
    }
  },

  watch: {
    id () {
      this.showParameters = false
      this.currentView = '_output'
      this.$_init = false
      this.open()
      this.runDisplayPriority()
    }
  },

  mounted () {
    this.open()
  },

  methods: {
    open () {
      this.$apollo.mutate({
        mutation: TASK_OPEN,
        variables: {
          id: this.id
        }
      })
    },

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
    },

    async saveParameters () {
      await this.$apollo.mutate({
        mutation: TASK_SAVE_PARAMETERS,
        variables: {
          id: this.id
        }
      })
      this.showParameters = false
    },

    async restoreParameters () {
      await this.$apollo.mutate({
        mutation: TASK_RESTORE_PARAMETERS,
        variables: {
          id: this.id
        }
      })
      this.showParameters = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.project-task-details
  v-box()
  align-items stretch
  height 100%

@media (max-width: 1250px)
  .actions-bar
    flex-direction column

  .views
    margin-top $padding-item

.command
  flex 1
  font-family $font-mono
  font-size 12px
  background rgba($vue-ui-color-primary, .2)
  color $vue-ui-color-dark
  padding 10px 16px
  height 32px
  border-radius $br
  ellipsis()
  box-sizing border-box
  .vue-ui-dark-mode &
    background $vue-ui-color-dark
    color $vue-ui-color-light

.content
  flex auto 1 1
  height 0
  margin 0 $padding-item $padding-item
  position relative

.placeholder-content .view,
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
      .vue-ui-dark-mode &
        fill $vue-ui-color-light-neutral

  .name
    font-size 22px
    color $vue-ui-color-dark
    position relative
    top -1px
    .vue-ui-dark-mode &
      color $vue-ui-color-light-neutral

  .description
    flex 1
    color $color-text-light
    margin 0 $padding-item
    ellipsis()

.main-actions
  flex 1

  /deep/ > *
    &:not(:last-child)
      margin-right $padding-item

.task-settings
  padding $padding-item
  box-sizing border-box
  width 700px
  .prompts
    max-height 500px
    overflow-y auto
</style>
