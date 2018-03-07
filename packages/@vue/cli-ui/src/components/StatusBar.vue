<template>
  <div class="status-bar">
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
      v-tooltip="'Console'"
      @click="$emit('console')"
    >
      <VueIcon icon="subtitles"/>
      <span v-if="consoleLog">{{ consoleLog }}</span>
    </div>
  </div>
</template>

<script>
import PROJECT_CURRENT from '../graphql/projectCurrent.gql'

export default {
  data () {
    return {
      consoleLog: '',
      projectCurrent: null
    }
  },

  apollo: {
    projectCurrent: PROJECT_CURRENT
  }
}
</script>


<style lang="stylus" scoped>
@import "~@/style/imports"

.status-bar
  h-box()
  align-items center
  background $vue-color-light-neutral
  font-size $padding-item

  .section
    h-box()
    align-items center
    opacity .5
    padding 0 8px
    height 100%
    cursor default

    &:hover
      opacity 1
      background lighten(@background, 40%)

    > .vue-icon + *
      margin-left 4px

    .label
      color lighten($vue-color-dark, 20%)
</style>
