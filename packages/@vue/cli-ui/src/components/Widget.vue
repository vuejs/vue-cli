<template>
  <transition>
    <div
      class="widget"
      :class="{
        customizing: customizeMode,
        moving: moveState
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
            </div>
            <div class="content">
              <ClientAddonComponent
                :name="widget.definition.component"
                class="view"
              />
            </div>
          </div>

          <div
            v-if="customizeMode"
            class="customize-overlay"
            @mousedown="onMoveStart"
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
    </div>
  </transition>
</template>

<script>
import WIDGET_REMOVE from '../graphql/widgetRemove.gql'
import WIDGET_MOVE from '../graphql/widgetMove.gql'
import WIDGETS from '../graphql/widgets.gql'
import WIDGET_DEFINITION_FRAGMENT from '../graphql/widgetDefinitionFragment.gql'

const GRID_SIZE = 200

export default {
  provide () {
    return {
      widget: {
        data: this.widget,
        openDetails: this.openDetails,
        remove: this.remove
      }
    }
  },

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
      moveState: null
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
    }
  },

  beforeDestroy () {
    this.removeMoveListeners()
  },

  methods: {
    getPositionStyle (x, y) {
      return {
        left: `${x}px`,
        top: `${y}px`
      }
    },

    getSizeStyle () {
      return {
        width: `${GRID_SIZE * this.widget.width}px`,
        height: `${GRID_SIZE * this.widget.height}px`
      }
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
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.shell,
.move-ghost
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
.move-ghost .backdrop
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

  .title
    opacity .5
    color $vue-ui-color-dark-neutral
    .vue-ui-dark-mode &
      color $vue-ui-color-light-neutral

.content
  flex 1

.view
  width 100%
  height 100%
  box-sizing border-box

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

.move-ghost
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

.widget
  &:not(.moving)
    .shell
      transition left .15s, top .15s

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
