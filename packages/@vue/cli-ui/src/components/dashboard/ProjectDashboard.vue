<template>
  <div
    class="project-dashboard page"
    :class="{
      customizing: customizeMode,
      'widget-details-shown': injected.isWidgetDetailsShown
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
          ref="widgets"
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
import OnWindowResize from '@/mixins/OnWindowResize'

const PADDING = 8

export default {
  provide () {
    return {
      dashboard: this.injected
    }
  },

  mixins: [
    OnWindowResize()
  ],

  metaInfo () {
    return {
      title: this.$t('org.vue.views.project-dashboard.title')
    }
  },

  data () {
    return {
      customizeMode: false,
      injected: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        isWidgetDetailsShown: false
      }
    }
  },

  methods: {
    onWindowResize () {
      const el = this.$refs.widgets.$el
      if (!el) return
      const bounds = el.getBoundingClientRect()
      this.injected.width = bounds.width - PADDING * 2
      this.injected.height = bounds.height - PADDING * 2
      this.injected.left = bounds.left
      this.injected.top = bounds.top
    }
  }
}
</script>

<style lang="stylus" scoped>
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
  width 360px

.customizing
  .widgets-wrapper
    transform scale(.7)

.widget-details-shown
  .widgets
    overflow hidden
  .widgets-wrapper > .widget /deep/ > .shell
    opacity 0
</style>
