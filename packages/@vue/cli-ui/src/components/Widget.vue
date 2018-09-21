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
        :style="style"
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
              @click="remove()"
            />

            <template v-if="isSelected">
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

import WIDGET_REMOVE from '../graphql/widgetRemove.gql'
import WIDGET_MOVE from '../graphql/widgetMove.gql'
import WIDGETS from '../graphql/widgets.gql'
import WIDGET_FRAGMENT from '../graphql/widgetFragment.gql'
import WIDGET_DEFINITION_FRAGMENT from '../graphql/widgetDefinitionFragment.gql'
import WIDGET_CONFIG_OPEN from '../graphql/widgetConfigOpen.gql'
import WIDGET_CONFIG_SAVE from '../graphql/widgetConfigSave.gql'

const GRID_SIZE = 200

const state = new Vue({
  data: {
    selectedWidget: null
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
      moveState: null,
      resizeState: null,
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
    style () {
      if (this.moveState) {
        return {
          ...this.getPositionStyle(this.moveState.x, this.moveState.y),
          ...this.getSizeStyle()
        }
      }
      if (this.resizeState) {
        return {
          ...this.getPositionStyle(this.resizeState.pxX, this.resizeState.pxY),
          ...this.getSizeStyle(this.resizeState.pxWidth, this.resizeState.pxHeight)
        }
      }
      return {
        ...this.getPositionStyle(GRID_SIZE * this.widget.x, GRID_SIZE * this.widget.y),
        ...this.getSizeStyle()
      }
    },

    moveGhostStyle () {
      return {
        ...this.getPositionStyle(GRID_SIZE * this.moveState.gridX, GRID_SIZE * this.moveState.gridY),
        ...this.getSizeStyle()
      }
    },

    resizeGhostStyle () {
      return {
        ...this.getPositionStyle(GRID_SIZE * this.resizeState.x, GRID_SIZE * this.resizeState.y),
        ...this.getSizeStyle(GRID_SIZE * this.resizeState.width, GRID_SIZE * this.resizeState.height)
      }
    },

    isSelected () {
      return this.widget === state.selectedWidget
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
        state.selectedWidget = null
      }
    }
  },

  created () {
    this.resizeHandles = [
      'top-left',
      'top',
      'top-right',
      'right',
      'bottom-right',
      'bottom',
      'bottom-left',
      'left'
    ]
  },

  beforeDestroy () {
    this.removeMoveListeners()
    this.removeResizeListeners()
  },

  methods: {
    getPositionStyle (x, y) {
      return {
        left: `${x}px`,
        top: `${y}px`
      }
    },

    getSizeStyle (width, height) {
      return {
        width: `${width || GRID_SIZE * this.widget.width}px`,
        height: `${height || GRID_SIZE * this.widget.height}px`
      }
    },

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
      // TODOnv
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

    // Moving

    removeMoveListeners () {
      window.removeEventListener('mousemove', this.onMoveUpdate)
      window.removeEventListener('mouseup', this.onMoveEnd)
    },

    updateMoveState (e) {
      const mouseDeltaX = e.clientX - this.$_initalMousePosition.x
      const mouseDeltaY = e.clientY - this.$_initalMousePosition.y
      const x = this.$_initialPosition.x + mouseDeltaX / 0.7
      const y = this.$_initialPosition.y + mouseDeltaY / 0.7
      let gridX = Math.round(x / GRID_SIZE)
      let gridY = Math.round(y / GRID_SIZE)
      if (gridX < 0) gridX = 0
      if (gridY < 0) gridY = 0
      this.moveState = {
        x,
        y,
        gridX,
        gridY
      }
    },

    onMoveStart (e) {
      this.$_initalMousePosition = {
        x: e.clientX,
        y: e.clientY
      }
      this.$_initialPosition = {
        x: this.widget.x * GRID_SIZE,
        y: this.widget.y * GRID_SIZE
      }
      this.updateMoveState(e)
      window.addEventListener('mousemove', this.onMoveUpdate)
      window.addEventListener('mouseup', this.onMoveEnd)
    },

    onMoveUpdate (e) {
      this.updateMoveState(e)
    },

    async onMoveEnd (e) {
      this.updateMoveState(e)
      this.removeMoveListeners()
      await this.$apollo.mutate({
        mutation: WIDGET_MOVE,
        variables: {
          input: {
            id: this.widget.id,
            x: this.moveState.gridX,
            y: this.moveState.gridY,
            width: this.widget.width,
            height: this.widget.height
          }
        }
      })
      this.moveState = null
    },

    // Resizing

    select () {
      state.selectedWidget = this.widget
    },

    removeResizeListeners () {
      window.removeEventListener('mousemove', this.onResizeMove)
      window.removeEventListener('mouseup', this.onResizeEnd)
    },

    updateResizeState (e) {
      const mouseDeltaX = (e.clientX - this.$_initalMousePosition.x) / 0.7
      const mouseDeltaY = (e.clientY - this.$_initalMousePosition.y) / 0.7
      const handle = this.$_resizeHandle
      let dX = 0
      let dY = 0
      let dWidth = 0
      let dHeight = 0
      // TODO
      if (handle.includes('right')) {
        dWidth = mouseDeltaX
      }
      if (handle.includes('bottom')) {
        dHeight = mouseDeltaY
      }
      let gridDX = Math.round(dX / GRID_SIZE)
      let gridDY = Math.round(dY / GRID_SIZE)
      let gridDWidth = Math.round(dWidth / GRID_SIZE)
      let gridDHeight = Math.round(dHeight / GRID_SIZE)
      if (this.widget.width + gridDWidth < this.widget.definition.minWidth) {
        gridDWidth = this.widget.definition.minWidth - this.widget.width
      }
      if (this.widget.width + gridDWidth > this.widget.definition.maxWidth) {
        gridDWidth = this.widget.definition.maxWidth - this.widget.width
      }
      if (this.widget.height + gridDHeight < this.widget.definition.minHeight) {
        gridDHeight = this.widget.definition.minHeight - this.widget.height
      }
      if (this.widget.height + gridDHeight > this.widget.definition.maxHeight) {
        gridDHeight = this.widget.definition.maxHeight - this.widget.height
      }
      this.resizeState = {
        x: this.widget.x + gridDX,
        y: this.widget.y + gridDY,
        width: this.widget.width + gridDWidth,
        height: this.widget.height + gridDHeight,
        pxX: this.widget.x * GRID_SIZE + dX,
        pxY: this.widget.y * GRID_SIZE + dY,
        pxWidth: this.widget.width * GRID_SIZE + dWidth,
        pxHeight: this.widget.height * GRID_SIZE + dHeight
      }
    },

    onResizeStart (e, handle) {
      this.$_initalMousePosition = {
        x: e.clientX,
        y: e.clientY
      }
      this.$_resizeHandle = handle
      this.updateResizeState(e)
      window.addEventListener('mousemove', this.onResizeMove)
      window.addEventListener('mouseup', this.onResizeEnd)
    },

    onResizeMove (e) {
      this.updateResizeState(e)
    },

    async onResizeEnd (e) {
      this.updateResizeState(e)
      this.removeResizeListeners()
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
      this.resizeState = null
      console.log('resize end')
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

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
  &:hover
    background rgba($vue-ui-color-primary, .2)

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

.remove-button
  position absolute
  top $padding-item
  right $padding-item

.customizing
  .wrapper
    border-radius ($br / .7)

  .content-wrapper
    opacity .5
    filter blur(8px)

  .customize-overlay
    /deep/ > *
      transform scale(1/.7)

  .resize-handle
    position absolute
    width 12px
    height @width
    border-radius 50%
    background rgba($vue-ui-color-primary, .5)
    &:hover
      background $vue-ui-color-primary
    &.top,
    &.top-left,
    &.top-right
      top (-@height / 2)
    &.bottom,
    &.bottom-left,
    &.bottom-right
      bottom (-@height / 2)
    &.left,
    &.top-left,
    &.bottom-left
      left (-@width / 2)
    &.right,
    &.top-right,
    &.bottom-right
      right (-@width / 2)
    &.top,
    &.bottom
      left calc(50% - (@width / 2))
      cursor ns-resize
    &.left,
    &.right
      top calc(50% - (@height / 2))
      cursor ew-resize
    &.top-left,
    &.bottom-right
      cursor nwse-resize
    &.top-right,
    &.bottom-left
      cursor nesw-resize

.move-ghost,
.resize-ghost
  .backdrop
    background rgba($vue-ui-color-accent, .2)
    border-radius ($br / .7)
    .vue-ui-dark-mode &
      background rgba(lighten($vue-ui-color-accent, 60%), .2)

.moving
  .shell
    z-index 10001
    .wrapper
      box-shadow 0 5px 30px rgba($md-black, .2)
  .move-ghost
    z-index 10000

.resizing
  .shell
    z-index 10001
    opacity .5
  .resize-ghost
    z-index 10000

.widget
  &:not(.moving)
    .shell
      transition left .15s, top .15s

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
      transform scale(.7)
      opacity 0
</style>
