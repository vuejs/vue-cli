<template>
  <div class="status-bar">
    <LoggerView
      v-if="showLogs"
    />

    <div class="content">
      <div
        class="section current-project"
        v-tooltip="'Current project'"
        @click="$emit('project')"
      >
        <VueIcon icon="work"/>
        <span v-if="projectCurrent">{{ projectCurrent.name }}</span>
        <span v-else class="label">No project</span>
      </div>

      <ApolloQuery
        :query="require('@/graphql/cwd.gql')"
        class="section current-path"
        v-tooltip="'Current Working Directory'"
        @click.native="$emit('cwd')"
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
        class="section console-log"
        v-tooltip="'Logs'"
        @click="onConsoleClick()"
      >
        <VueIcon icon="subtitles"/>
        <LoggerMessage class="last-message"
          v-if="consoleLogLast"
          :message="consoleLogLast"
        />
        <!-- <TerminalView
          :cols="100"
          :rows="1"
          :content="consoleLogLast"
          auto-size
          :options="{
            scorllback: 0,
            disableStdin: true
          }"
        /> -->
      </div>
    </div>
  </div>
</template>

<script>
import LoggerMessage from '../components/LoggerMessage'
import LoggerView from '../components/LoggerView'

import PROJECT_CURRENT from '../graphql/projectCurrent.gql'
import CONSOLE_LOG_LAST from '../graphql/consoleLogLast.gql'
import CONSOLE_LOG_ADDED from '../graphql/consoleLogAdded.gql'

export default {
  components: {
    LoggerMessage,
    LoggerView
  },

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
    onConsoleClick () {
      this.$emit('console')
      this.showLogs = !this.showLogs
    }
  }
}
</script>


<style lang="stylus" scoped>
@import "~@/style/imports"

.status-bar
  $bg = $vue-color-light-neutral

  .content
    h-box()
    align-items center
    background $bg
    font-size $padding-item
    height 28px

  .section
    h-box()
    align-items center
    opacity .5
    padding 0 8px
    height 100%
    cursor default

    &:hover
      opacity 1
      background lighten($bg, 40%)

    > .vue-icon + *
      margin-left 4px

    .label
      color lighten($vue-color-dark, 20%)

  .console-log
    &,
    .last-message
      flex 100% 1 1
      width 0

    .last-message
      font-size .9em
</style>
