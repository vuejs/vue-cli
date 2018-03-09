<template>
  <div class="logger-view">
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
        </template>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import LoggerMessage from './LoggerMessage'

export default {
  components: {
    LoggerMessage
  },

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

    clearLogs () {
      // TODO
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.logger-view
  background $vue-color-light-neutral
  padding $padding-item 0
  height 160px
  display grid
  grid-template-columns 1fr
  grid-template-rows 1fr
  grid-template-areas "logs"

  .logs
    grid-area logs
    padding 0 $padding-item
    overflow-x hidden
    overflow-y auto
    font-size 12px

  .logger-message
    &:hover
      background lighten(@background, 40%)
</style>
