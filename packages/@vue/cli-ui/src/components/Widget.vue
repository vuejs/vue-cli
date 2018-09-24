<template>
  <transition duration="150">
    <div
      class="widget"
      :class="{
        customizing: customizeMode,
        moving: moveState,
        resizing: resizeState,
        selected: isSelected
      }"
    >
      <div
        class="shell"
        :style="mainStyle"
      >
        <div class="wrapper">
          <div class="content-wrapper">
            <div class="header">
              <div class="title">{{ $t(widget.definition.title) }}</div>
              <VueButton
                v-if="widget.definition.hasConfigPrompts"
                icon-left="settings"
                class="icon-button flat primary"
                v-tooltip="$t('org.vue.components.widget.configure')"
                @click="openConfig()"
              />
            </div>

            <div v-if="widget.configured" class="content">
              <ClientAddonComponent
                :name="widget.definition.component"
                class="view"
              />
            </div>

            <div v-else class="content not-configured">
              <VueIcon
                icon="settings"
                class="icon huge"
              />
              <VueButton
                :label="$t('org.vue.components.widget.configure')"
                @click="openConfig()"
              />
            </div>
          </div>

          <div
            v-if="customizeMode"
            class="customize-overlay"
            @mousedown="onMoveStart"
            @click="select()"
          >
            <div class="definition-chip">
              <ItemLogo
                :image="widget.definition.icon"
                fallback-icon="widgets"
                class="icon"
              />
              <div class="title">{{ $t(widget.definition.title) }}</div>
            </div>
            <VueButton
              class="remove-button primary flat icon-button"
              icon-left="close"
              v-tooltip="$t('org.vue.components.widget.remove')"
              @mousedown.native.stop
              @click.stop="remove()"
            />

            <template v-if="showResizeHandle">
              <div
                v-for="handle of resizeHandles"
                :key="handle"
                class="resize-handle"
                :class="[
                  handle
                ]"
                @mousedown.stop="onResizeStart($event, handle)"
              />
            </template>
          </div>
        </div>
      </div>

      <div
        v-if="moveState"
        class="move-ghost"
        :style="moveGhostStyle"
      >
        <div class="backdrop"/>
      </div>

      <div
        v-if="resizeState"
        class="resize-ghost"
        :style="resizeGhostStyle"
      >
        <div class="backdrop"/>
      </div>

      <VueModal
        v-if="showConfig"
        :title="$t('org.vue.components.widget.configure')"
        class="medium"
        @close="showConfig = false"
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
            :label="$t('org.vue.components.widget.save')"
            @click="saveConfig()"
          />
        </div>
      </VueModal>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import Prompts from '../mixins/Prompts'
import OnGrid from '../mixins/OnGrid'
import Movable from '../mixins/Movable'
import Resizable from '../mixins/Resizable'

import WIDGET_REMOVE from '../graphql/widgetRemove.gql'
import WIDGET_MOVE from '../graphql/widgetMove.gql'
import WIDGETS from '../graphql/widgets.gql'
import WIDGET_FRAGMENT from '../graphql/widgetFragment.gql'
import WIDGET_DEFINITION_FRAGMENT from '../graphql/widgetDefinitionFragment.gql'
import WIDGET_CONFIG_OPEN from '../graphql/widgetConfigOpen.gql'
import WIDGET_CONFIG_SAVE from '../graphql/widgetConfigSave.gql'

const GRID_SIZE = 200
const ZOOM = 0.7

const state = new Vue({
  data: {
    selectedWidgetId: null
  }
})

export default {
  provide () {
    return {
      widget: this.injected
    }
  },

  mixins: [
    Prompts({
      field: 'widget',
      update (store, prompts) {
        store.writeFragment({
          fragment: WIDGET_FRAGMENT,
          fragmentName: 'widget',
          id: this.widget.id,
          data: {
            prompts
          }
        })
      }
    }),

    OnGrid({
      field: 'widget',
      gridSize: GRID_SIZE
    }),

    Movable({
      field: 'widget',
      gridSize: GRID_SIZE,
      zoom: ZOOM
    }),

    Resizable({
      field: 'widget',
      gridSize: GRID_SIZE,
      zoom: ZOOM
    })
  ],

  props: {
    widget: {
      type: Object,
      required: true
    },

    customizeMode: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showConfig: false,
      injected: {
        data: this.widget,
        openConfig: this.openConfig,
        openDetails: this.openDetails,
        remove: this.remove
      }
    }
  },

  computed: {
    isSelected () {
      return this.widget.id === state.selectedWidgetId
    }
  },

  watch: {
    widget: {
      handler (value) {
        this.injected.data = value
      }
    },

    customizeMode (value) {
      if (!value && this.isSelected) {
        state.selectedWidgetId = null
      }
    }
  },

  methods: {
    async openConfig () {
      await this.$apollo.mutate({
        mutation: WIDGET_CONFIG_OPEN,
        variables: {
          id: this.widget.id
        }
      })
      this.showConfig = true
    },

    async saveConfig () {
      this.showConfig = false
      await this.$apollo.mutate({
        mutation: WIDGET_CONFIG_SAVE,
        variables: {
          id: this.widget.id
        }
      })
    },

    openDetails () {
      // TODO
    },

    remove () {
      this.$apollo.mutate({
        mutation: WIDGET_REMOVE,
        variables: {
          id: this.widget.id
        },
        update: (store, { data: { widgetRemove } }) => {
          const data = store.readQuery({ query: WIDGETS })
          data.widgets = data.widgets.filter(w => w.id !== this.widget.id)
          store.writeQuery({ query: WIDGETS, data })
          store.writeFragment({
            fragment: WIDGET_DEFINITION_FRAGMENT,
            id: widgetRemove.definition.id,
            data: widgetRemove.definition
          })
        }
      })
    },

    select () {
      state.selectedWidgetId = this.widget.id
    },

    async onMoved () {
      await this.$apollo.mutate({
        mutation: WIDGET_MOVE,
        variables: {
          input: {
            id: this.widget.id,
            x: this.moveState.x,
            y: this.moveState.y,
            width: this.widget.width,
            height: this.widget.height
          }
        }
      })
    },

    async onResized () {
      await this.$apollo.mutate({
        mutation: WIDGET_MOVE,
        variables: {
          input: {
            id: this.widget.id,
            x: this.resizeState.x,
            y: this.resizeState.y,
            width: this.resizeState.width,
            height: this.resizeState.height
          }
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

$zoom = .7

.shell,
.move-ghost,
.resize-ghost
  position absolute
  padding ($padding-item / 2)
  box-sizing border-box

.wrapper
  border rgba($vue-ui-color-primary, .2) solid 1px
  background $vue-ui-color-light
  border-radius $br
  .vue-ui-dark-mode &
    background $vue-ui-color-darker

.wrapper,
.content-wrapper,
.move-ghost .backdrop,
.resize-ghost .backdrop
  width 100%
  height 100%

.wrapper,
.content-wrapper
  display flex
  flex-direction column
  position relative

.wrapper
  transition box-shadow .15s

.header
  padding ($padding-item / 2) $padding-item
  h-box()

  .title
    flex 1
    opacity .5
    color $vue-ui-color-dark-neutral
    .vue-ui-dark-mode &
      color $vue-ui-color-light-neutral

  .icon-button
    width 20px
    height @width

.content
  flex 1
  overflow hidden

.view
  width 100%
  height 100%
  box-sizing border-box

.not-configured
  v-box()
  box-center()
  .icon
    margin-bottom $padding-item
    >>> svg
      fill $color-text-light

.customize-overlay
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  z-index 1
  border-radius $br
  v-box()
  box-center()
  cursor move
  user-select none
  box-sizing border-box
  border transparent 1px solid

  /deep/ > *
    transition transform .15s

  .definition-chip
    background $vue-ui-color-primary
    color $vue-ui-color-light
    border-radius 21px
    user-select none
    h-box()
    box-center()

    .title
      padding ($padding-item / 2) $padding-item
      padding-left 0

    .icon
      margin-right ($padding-item / 2)
      >>> svg
        fill @color

.customize-overlay:hover,
.selected .customize-overlay
  background rgba($vue-ui-color-primary, .2)

.remove-button
  position absolute
  top $padding-item
  right $padding-item

.customizing
  .wrapper
    border-radius ($br / $zoom)

  .content-wrapper
    opacity .5
    filter blur(8px)

  .customize-overlay
    /deep/ > *
      transform scale(1/$zoom)

.move-ghost,
.resize-ghost
  z-index 10000
  .backdrop
    background rgba($vue-ui-color-accent, .2)
    border-radius ($br / $zoom)
    .vue-ui-dark-mode &
      background rgba(lighten($vue-ui-color-accent, 60%), .2)

.moving,
.resizing
  .shell
    z-index 10001

.moving
  .shell
    .wrapper
      box-shadow 0 5px 30px rgba($md-black, .2)

.resizing
  .shell
    opacity .5

.widget
  .shell
    transition opacity .15s
  &:not(.moving):not(.resizing)
    .shell
      transition opacity .15s, left .15s, top .15s, width .15s, height .15s

  &.selected
    .customize-overlay
      border $vue-ui-color-primary solid 1px

  &.v-enter-active,
  &.v-leave-active
    .shell
      transition transform .15s, opacity .15s
  &.v-enter,
  &.v-leave-to
    .shell
      transform scale($zoom)
      opacity 0
</style>
