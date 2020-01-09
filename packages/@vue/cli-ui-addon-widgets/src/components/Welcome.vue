<template>
  <div class="welcome">
    <div class="logo-wrapper">
      <ItemLogo
        image="/public/vue-logo.png"
        class="logo vuejs"
      />
    </div>
    <div class="title">
      {{ $t('org.vue.widgets.welcome.content.title') }}
    </div>
    <div class="tips">
      <div
        v-for="n in 3"
        :key="n"
        :data-n="n"
        class="tip"
      >
        <ItemLogo
          :image="tipIcons[n - 1]"
          class="icon"
        />
        <div class="message">
          {{ $t(`org.vue.widgets.welcome.content.tip${n}`) }}
        </div>
      </div>
    </div>
    <div class="actions">
      <VueButton
        :label="$t('org.vue.widgets.welcome.content.ok')"
        icon-left="done"
        class="primary big"
        @click="widget.remove()"
      />
    </div>
  </div>
</template>

<script>
export default {
  inject: [
    'widget'
  ],

  created () {
    this.tipIcons = [
      'dashboard',
      'arrow_back',
      'home'
    ]
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.welcome
  padding $padding-item
  v-box()

.logo-wrapper
  v-box()
  box-center()
  margin $padding-item 0
  .logo
    width 100px
    height @width

.title
  font-size 32px
  font-weight 300
  text-align center
  margin-bottom ($padding-item * 2)

.tips
  flex 1

.tip
  padding ($padding-item * 2)
  h-box()
  box-center()

  .icon
    >>> svg
      fill rgba($vue-ui-color-primary, .7) !important

  .message
    flex 1
    margin-left ($padding-item / 2)

.actions
  h-box()
  box-center()
  margin-bottom $padding-item
</style>
