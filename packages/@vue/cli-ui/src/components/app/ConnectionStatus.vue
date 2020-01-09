<template>
  <ApolloQuery
    :query="require('@/graphql/connected/connected.gql')"
    fetch-policy="cache-only"
    class="connection-status"
  >
    <template slot-scope="{ result: { data: { connected } } }">
      <transition duration="1000">
        <div
          v-if="!connected"
          class="banner"
        >
          <div class="content disconnected">
            <VueIcon icon="cloud_off" class="medium"/>
            <span>{{ $t('org.vue.components.connection-status.disconnected') }}</span>
          </div>
          <div class="content connected">
            <VueIcon icon="wifi" class="medium"/>
            <span>{{ $t('org.vue.components.connection-status.connected') }}</span>
          </div>
        </div>
      </transition>
    </template>
  </ApolloQuery>
</template>

<script>
export default {
  clientState: true
}
</script>

<style lang="stylus" scoped>
.content
  display flex
  align-items center
  justify-content center
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  z-index 90000

.banner
  background $vue-ui-color-danger
  color $md-white
  height 45px
  position relative
  .vue-ui-icon
    margin-right $padding-item
  >>> svg
    fill @color

  &.v-enter-active,
  &.v-leave-active
    overflow hidden
  &.v-enter-active
    transition height .15s ease-out
    .vue-ui-icon
      animation icon .5s
  &.v-leave-active
    transition height .15s .85s ease-out, background .15s
    .disconnected
      animation slide-to-bottom .15s forwards
    .connected
      animation slide-from-top .15s
  &:not(.v-leave-active)
    .connected
      display none

  &.v-enter,
  &.v-leave-to
    height 0
  &.v-leave-to
    background $vue-ui-color-success

@keyframes icon
  0%
    transform scale(.8)
    opacity 0
  30%
    transform scale(.8)
    opacity 1
  50%
    transform scale(1.3)
  100%
    transform scale(1)

@keyframes slide-to-bottom
  0%
    transform none
    opacity 1
  100%
    transform translateY(45px)
    opacity 0

@keyframes slide-from-top
  0%
    transform translateY(-45px)
    opacity 0
  100%
    transform none
    opacity 1
</style>
