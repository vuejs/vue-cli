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
        class="section action bug-report"
        @click="onBugReportClick()"
      >
        <VueIcon icon="bug_report"/>
        <span>{{ $t('components.status-bar.report-bug') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import PROJECT_CURRENT from '../graphql/projectCurrent.gql'
import CONSOLE_LOG_LAST from '../graphql/consoleLogLast.gql'
import CONSOLE_LOG_ADDED from '../graphql/consoleLogAdded.gql'

let lastRoute

export default {
  data () {
    return {
      consoleLogLast: null,
      showLogs: false,
      projectCurrent: null
    }
  },

  apollo: {
    projectCurrent: {
      query: PROJECT_CURRENT,
      fetchPolicy: 'cache-and-network'
    },

    consoleLogLast: {
      query: CONSOLE_LOG_LAST,
      fetchPolicy: 'cache-and-network'
    },

    $subscribe: {
      consoleLogAdded: {
        query: CONSOLE_LOG_ADDED,
        result ({ data }) {
          this.consoleLogLast = data.consoleLogAdded
        }
      }
    }
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
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.status-bar
  $bg = $vue-ui-color-light-neutral

  .content
    h-box()
    align-items center
    background $bg
    font-size $padding-item
    height 28px

  .section
    h-box()
    align-items center
    opacity .8
    padding 0 8px
    height 100%
    cursor default

    &:hover
      opacity 1
      background lighten($bg, 40%)

    > .vue-ui-icon + *
      margin-left 4px

    .label
      color lighten($vue-ui-color-dark, 20%)

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
