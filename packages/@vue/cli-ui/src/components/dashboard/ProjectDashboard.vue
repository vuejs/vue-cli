<template>
  <div
    class="project-dashboard page"
    :class="{
      customizing: customizeMode
    }"
  >
    <ContentView
      :title="$t('org.vue.views.project-dashboard.title')"
    >
      <template slot="actions">
        <VueButton
          v-if="!customizeMode"
          icon-left="edit"
          :label="$t('org.vue.views.project-dashboard.cutomize')"
          class="primary round"
          @click="customizeMode = true"
        />
        <VueButton
          v-else
          icon-left="done"
          :label="$t('org.vue.views.project-dashboard.done')"
          class="primary round"
          @click="customizeMode = false"
        />
      </template>

      <div class="panes fill-height">
        <ApolloQuery
          :query="require('@/graphql/widget/widgets.gql')"
          class="widgets"
        >
          <div
            slot-scope="{ result: { data, loading } }"
            class="widgets-wrapper"
          >
            <VueLoadingIndicator
              v-if="loading && (!data || !data.widgets)"
              class="overlay"
            />

            <template v-else-if="data">
              <Widget
                v-for="widget of data.widgets"
                :key="widget.id"
                :widget="widget"
                :customize-mode="customizeMode"
              />
            </template>
          </div>
        </ApolloQuery>

        <transition name="sidepane">
          <WidgetAddPane
            v-if="customizeMode"
            @close="customizeMode = false"
          />
        </transition>
      </div>
    </ContentView>
  </div>
</template>

<script>
export default {
  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-dashboard.title')
    }
  },

  data () {
    return {
      customizeMode: false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.panes
  h-box()

.widgets
  flex 1
  overflow auto
  padding ($padding-item / 2)
  box-sizing border-box

.widgets-wrapper
  position relative
  transform-origin top left
  transition transform .15s

.widget-add-pane
  width 300px

.customizing
  .widgets-wrapper
    transform scale(.7)
</style>
