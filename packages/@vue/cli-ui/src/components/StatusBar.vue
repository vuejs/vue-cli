<template>
  <div class="status-bar">
    <LoggerView
      v-if="showLogs"
      @close="showLogs = false"
    />

    <div class="content">
      <div
        class="section action current-project"
        v-tooltip="$t('components.status-bar.project.tooltip')"
        @click="onProjectClick()"
      >
        <VueIcon icon="work"/>
        <span v-if="projectCurrent">{{ projectCurrent.name }}</span>
        <span v-else class="label">{{ $t('components.status-bar.project.empty') }}</span>
      </div>

      <ApolloQuery
        :query="require('@/graphql/cwd.gql')"
        class="section current-path"
        v-tooltip="$t('components.status-bar.path.tooltip')"
        @click.native="onCwdClick()"
      >
        <ApolloSubscribeToMore
          :document="require('@/graphql/cwdChanged.gql')"
          :update-query="(previousResult, { subscriptionData }) => ({
            cwd: subscriptionData.data.cwd
          })"
        />

        <template slot-scope="{ result: { data } }">
          <VueIcon icon="folder"/>
          <span v-if="data">{{ data.cwd }}</span>
        </template>
      </ApolloQuery>

      <div
        class="section action console-log"
        v-tooltip="$t('components.status-bar.log.tooltip')"
        @click="onConsoleClick()"
      >
        <VueIcon icon="dvr"/>
        <LoggerMessage class="last-message"
          v-if="consoleLogLast"
          :message="consoleLogLast"
        />
        <div v-else class="last-message">{{ $t('components.status-bar.log.empty') }}</div>
      </div>

      <div
        class="section action dark-mode"
        v-tooltip="$t('components.status-bar.dark-mode')"
        @click="toggleDarkMode()"
      >
        <VueIcon icon="invert_colors"/>
      </div>

      <div
        class="section action bug-report"
        @click="onBugReportClick()"
      >
        <VueIcon icon="bug_report"/>
        <span>{{ $t('components.status-bar.report-bug') }}</span>
      </div>
      <div
        class="section action translate"
        @click="onTranslateClick()"
      >
        <VueIcon icon="g_translate"/>
        <span>{{ $t('components.status-bar.translate') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import PROJECT_CURRENT from '../graphql/projectCurrent.gql'
import CONSOLE_LOG_LAST from '../graphql/consoleLogLast.gql'
import CONSOLE_LOG_ADDED from '../graphql/consoleLogAdded.gql'
import DARK_MODE from '../graphql/darkMode.gql'
import DARK_MODE_SET from '../graphql/darkModeSet.gql'

let lastRoute

export default {
  data () {
    return {
      showLogs: false,
      consoleLogLast: null
    }
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT,
    consoleLogLast: CONSOLE_LOG_LAST,
    darkMode: DARK_MODE,

    $subscribe: {
      consoleLogAdded: {
        query: CONSOLE_LOG_ADDED,
        result ({ data }) {
          this.consoleLogLast = data.consoleLogAdded
        }
      }
    }
  },

  created () {
    this.loadDarkMode()
  },

  methods: {
    onProjectClick () {
      this.$emit('project')
      if (this.$route.name === 'project-select') {
        this.$router.push(lastRoute || { name: 'project-home' })
      } else {
        if (this.$route.name === 'project-create') {
          lastRoute = null
        } else {
          const { name, params, query } = this.$route
          lastRoute = { name, params, query }
        }
        this.$router.push({ name: 'project-select' })
      }
    },

    onCwdClick () {
      this.$emit('cwd')
    },

    onConsoleClick () {
      this.$emit('console')
      this.showLogs = !this.showLogs
    },

    onBugReportClick () {
      const win = window.open(
        'https://new-issue.vuejs.org/?repo=vuejs/vue-cli',
        '_blank'
      )
      win.focus()
    },

    onTranslateClick () {
      const win = window.open(
        'https://github.com/vuejs/vue-cli/tree/dev/docs/localization.md',
        '_blank'
      )
      win.focus()
    },

    loadDarkMode () {
      const raw = localStorage.getItem('vue-ui-dark-mode')
      this.applyDarkMode(raw === 'true')
    },

    async applyDarkMode (enabled) {
      localStorage.setItem('vue-ui-dark-mode', enabled.toString())
      const el = document.getElementsByTagName('html')[0]
      if (enabled) {
        el.classList.add('vue-ui-dark-mode')
      } else {
        el.classList.remove('vue-ui-dark-mode')
      }
      await this.$apollo.mutate({
        mutation: DARK_MODE_SET,
        variables: {
          enabled
        }
      })
    },

    toggleDarkMode () {
      this.applyDarkMode(!this.darkMode)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.status-bar
  position relative
  z-index 1
  box-shadow 0 -2px 10px rgba(black, .05)
  .vue-ui-dark-mode &
    box-shadow 0 -2px 10px rgba(black, .2)

  .content
    h-box()
    align-items center
    background $vue-ui-color-light
    font-size $padding-item
    height 28px
    .vue-ui-dark-mode &
      background $vue-ui-color-darker

  .section
    h-box()
    align-items center
    opacity .8
    padding 0 8px
    height 100%
    cursor default

    &:hover
      opacity 1
      background lighten($vue-ui-color-light-neutral, 30%)
      .vue-ui-dark-mode &
        background $vue-ui-color-dark

    > .vue-ui-icon + *
      margin-left 4px

    .label
      color lighten($vue-ui-color-dark, 20%)
      .vue-ui-dark-mode &
        color lighten($vue-ui-color-dark-neutral, 20%)

    &.action
      user-select none
      cursor pointer

  .console-log
    &,
    .last-message
      flex 100% 1 1
      width 0

    .logger-message
      font-size .9em
      padding-right 0
</style>
