<template>
  <div class="status-widget">
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
              {{ $t('org.vue.widgets.status-widget.last-updated') }}
            </div>
            <VueTimeago
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
          <VueButton
            v-if="status.status !== 'loading'"
            v-tooltip="$t('org.vue.widgets.status-widget.check')"
            icon-left="cached"
            class="icon-button flat check-button"
            @click="$emit('check')"
          />
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
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.header
  h-box()
  align-items center
  padding $padding-item

.icon-wrapper
  position relative
  top -2px
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

.check-button
  margin-left 4px
  position relative
  top -4px

.actions
  h-box()
  box-center()
  /deep/ > *
    &:not(:last-child)
      margin-right ($padding-item / 2)
</style>
