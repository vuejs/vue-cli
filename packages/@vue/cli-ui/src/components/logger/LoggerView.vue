<template>
  <div class="logger-view">
    <div class="pane-toolbar">
      <VueIcon
        icon="dvr"
      />
      <div class="title">
        {{ $t('org.vue.components.logger-view.title') }}
      </div>
      <VueButton
        class="icon-button flat"
        icon-left="delete_forever"
        v-tooltip="$t('org.vue.components.logger-view.buttons.clear')"
        @click="clearLogs()"
      />
      <VueIcon
        icon="lens"
        class="separator"
      />
      <VueButton
        class="icon-button flat"
        icon-left="subdirectory_arrow_left"
        v-tooltip="$t('org.vue.components.logger-view.buttons.scroll')"
        @click="scrollToBottom()"
      />
      <VueButton
        class="icon-button flat"
        icon-left="close"
        v-tooltip="$t('org.vue.components.logger-view.buttons.close')"
        @click="close()"
      />
    </div>
    <ApolloQuery
      ref="logs"
      :query="require('@/graphql/console-log/consoleLogs.gql')"
      class="logs"
      @result="scrollToBottom()"
    >
      <ApolloSubscribeToMore
        :document="require('@/graphql/console-log/consoleLogAdded.gql')"
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
            <div>{{ $t('org.vue.components.logger-view.empty') }}</div>
          </div>
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import CONSOLE_LOGS from '@/graphql/console-log/consoleLogs.gql'
import CONSOLE_LOG_LAST from '@/graphql/console-log/consoleLogLast.gql'
import CONSOLE_LOGS_CLEAR from '@/graphql/console-log/consoleLogsClear.gql'

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
.logger-view
  background $vue-ui-color-light
  height 174px
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr
  grid-template-areas "toolbar" "logs"
  .vue-ui-dark-mode &
    background $vue-ui-color-darker

  .pane-toolbar
    grid-area toolbar

  .logs
    grid-area logs
    padding 0 $padding-item
    overflow-x hidden
    overflow-y auto

  .logger-message
    font-size 12px
    &:hover
      background rgba($vue-ui-color-primary, .05)
</style>
