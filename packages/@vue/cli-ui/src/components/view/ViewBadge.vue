<template>
  <div
    class="view-badge"
    :class="[
      `type-${badge.type}`
    ]"
  >
    <div class="content">
      <div class="counter">{{ badge.count }}</div>
      <div class="label">{{ $t(badge.label) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    badge: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.view-badge
  .content
    font-size 12px
    h-box()
    box-center()

    .counter
      min-width 22px
      text-align center
      border-radius 8px
      margin-right 6px
      font-family $font-mono

    .label
      flex auto 1 1

  &.type-info
    .counter
      background $vue-ui-color-info
  &.type-success
    .counter
      background $vue-ui-color-success
  &.type-error
    .counter
      background $vue-ui-color-danger
  &.type-warning
    .counter
      background $vue-ui-color-warning
  &.type-accent
    .counter
      background $vue-ui-color-accent
  &.type-dim
    .counter
      background $md-grey

  .vue-ui-dark-mode &
    .counter
      color white
</style>
