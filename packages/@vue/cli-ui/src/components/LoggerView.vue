<template>
  <div class="logger-view">
    <div class="toolbar">
      <VueIcon
        icon="dvr"
      />
      <div class="title">
        {{ $t('components.logger-view.title') }}
      </div>
      <VueButton
        class="icon-button"
        icon-left="delete_forever"
        v-tooltip="$t('components.logger-view.buttons.clear')"
        @click="clearLogs()"
      />
      <VueIcon
        icon="lens"
        class="separator"
      />
      <VueButton
        class="icon-button"
        icon-left="subdirectory_arrow_left"
        v-tooltip="$t('components.logger-view.buttons.scroll')"
        @click="scrollToBottom()"
      />
      <VueButton
        class="icon-button"
        icon-left="close"
        v-tooltip="$t('components.logger-view.buttons.close')"
        @click="close()"
      />
    </div>
    <ApolloQuery
      ref="logs"
      :query="require('../graphql/consoleLogs.gql')"
      fetch-policy="cache-and-network"
      class="logs"
      @result="scrollToBottom()"
    >
      <ApolloSubscribeToMore
        :document="require('../graphql/consoleLogAdded.gql')"
        :update-query="onConsoleLogAdded"
      />

      <template slot-scope="{ result: { data } }">
        <template v-if="data && data.consoleLogs">
          <LoggerMessage
            v-for="log of data.consoleLogs"
            :key="log.id"
            :message="log"
            pre
          />

          <div
            v-if="!data.consoleLogs.length"
            class="vue-ui-empty"
          >
            <VueIcon icon="wifi" class="large"/>
            <div>{{ $t('components.logger-view.empty') }}</div>
          </div>
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import CONSOLE_LOGS from '../graphql/consoleLogs.gql'
import CONSOLE_LOG_LAST from '../graphql/consoleLogLast.gql'
import CONSOLE_LOGS_CLEAR from '../graphql/consoleLogsClear.gql'

export default {
  methods: {
    onConsoleLogAdded (previousResult, { subscriptionData }) {
      this.scrollToBottom()
      return {
        consoleLogs: [
          ...previousResult.consoleLogs,
          subscriptionData.data.consoleLogAdded
        ]
      }
    },

    async scrollToBottom () {
      await this.$nextTick()
      const list = this.$refs.logs.$el
      list.scrollTop = list.scrollHeight
    },

    async clearLogs () {
      await this.$apollo.mutate({
        mutation: CONSOLE_LOGS_CLEAR,
        update: store => {
          store.writeQuery({
            query: CONSOLE_LOGS,
            data: { consoleLogs: [] }
          })
          store.writeQuery({
            query: CONSOLE_LOG_LAST,
            data: { consoleLogLast: null }
          })
        }
      })
      this.close()
    },

    close () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.logger-view
  background $vue-ui-color-light-neutral
  height 174px
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr
  grid-template-areas "toolbar" "logs"

  .toolbar
    grid-area toolbar
    h-box()
    align-items center
    padding 6px 6px 6px $padding-item
    > :not(.separator)
      space-between-x(6px)
    > * + .separator
      margin-left 6px
    .title
      flex 100% 1 1
      width 0
      ellipsis()

  .logs
    grid-area logs
    padding 0 $padding-item
    overflow-x hidden
    overflow-y auto

  .logger-message
    font-size 12px
    &:hover
      background lighten(@background, 40%)
</style>
