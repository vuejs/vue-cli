<template>
  <div v-if="implemented" class="status-widget">
    <div class="header">
      <div class="icon-wrapper">
        <ItemLogo
          :image="icon"
          class="icon"
          :class="iconClass"
        />
      </div>

      <div class="info">
        <div class="title" v-html="title"/>
        <div class="last-updated">
          <template v-if="status.lastUpdate">
            <div class="label">
              {{ message || $t('org.vue.widgets.status-widget.last-updated') }}
            </div>
            <VueTimeago
              v-if="!message"
              :datetime="status.lastUpdate"
              :auto-update="60"
            />
          </template>
          <div
            v-else
            class="label"
          >
            {{ $t('org.vue.widgets.status-widget.never') }}
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <slot name="actions">
        <VueButton
          v-if="status.status === 'attention'"
          :label="$t('org.vue.widgets.status-widget.more-info')"
          icon-left="add_circle"
          @click="widget.openDetails()"
        />
        <slot name="more-actions"/>
      </slot>
    </div>
  </div>
  <div v-else class="status-widget soon">
    <div class="text">Available Soon</div>
  </div>
</template>

<script>
export default {
  inject: [
    'widget'
  ],

  props: {
    icon: {
      type: String,
      required: true
    },

    iconClass: {
      type: [String, Array, Object],
      default: undefined
    },

    title: {
      type: String,
      required: true
    },

    status: {
      type: Object,
      required: true
    },

    message: {
      type: String,
      default: null
    },

    // TODO remove
    implemented: {
      type: Boolean,
      default: false
    }
  },

  created () {
    // this.widget.addHeaderAction({
    //   id: 'refresh',
    //   icon: 'refresh',
    //   tooltip: 'org.vue.widgets.status-widget.check',
    //   disabled: () => this.status.status === 'loading',
    //   onCalled: () => {
    //     this.$emit('check')
    //   }
    // })

    // this.widget.addHeaderAction({
    //   id: 'expand',
    //   icon: 'zoom_out_map',
    //   tooltip: 'org.vue.components.widget.open-details',
    //   hidden: () => this.status.status !== 'attention',
    //   onCalled: () => {
    //     this.widget.openDetails()
    //   }
    // })
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.header
  h-box()
  align-items center
  padding $padding-item
  margin 4px 0

.icon-wrapper
  .icon
    width 48px
    height @width
    >>> .vue-ui-icon
      width 32px
      height @width

.title
  font-size 18px

.last-updated
  color $color-text-light
  h-box()
  .label
    margin-right 4px

.actions
  h-box()
  box-center()
  /deep/ > *
    &:not(:last-child)
      margin-right ($padding-item / 2)

.soon
  display flex
  box-center()
  height 100%

  .text
    background $vue-ui-color-primary
    color $vue-ui-color-light
    padding 4px 14px
    border-radius 13px
    text-transform lowercase
    font-family monospace
    opacity .5
</style>
