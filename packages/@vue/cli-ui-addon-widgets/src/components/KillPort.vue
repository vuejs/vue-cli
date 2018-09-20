<template>
  <div
    class="kill-port"
    :class="[
      `status-${status}`
    ]"
  >
    <div class="wrapper">
      <div class="status">
        <VueLoadingIndicator
          v-if="status === 'killing'"
          class="icon"
        />
        <VueIcon
          v-else
          :icon="icon"
          class="icon large"
        />
        <div class="info">
          {{ $t(`org.vue.widgets.kill-port.status.${status}`) }}
        </div>
      </div>

      <div class="actions">
        <VueInput
          v-model="port"
          :placeholder="$t('org.vue.widgets.kill-port.input.placeholder')"
          class="input big"
          type="number"
          @keyup.enter="kill()"
        />
        <VueButton
          :label="$t('org.vue.widgets.kill-port.kill')"
          icon-left="flash_on"
          class="primary big"
          @click="kill()"
        />
      </div>
    </div>
  </div>
</template>

<script>
const ICONS = {
  idle: 'flash_on',
  killed: 'check_circle',
  error: 'error'
}

export default {
  sharedData () {
    return mapSharedData('org.vue.widgets.kill-port.', {
      status: 'status'
    })
  },

  data () {
    return {
      port: ''
    }
  },

  computed: {
    icon () {
      return ICONS[this.status] || ICONS.idle
    },

    inputValid () {
      return /\d+/.test(this.port)
    }
  },

  watch: {
    status (value) {
      if (value === 'killed') {
        this.port = ''
      }
      if (value !== 'killing' && value !== 'idle') {
        this.$_statusTimer = setTimeout(() => {
          this.status = 'idle'
        }, 3000)
      }
    }
  },

  methods: {
    kill () {
      clearTimeout(this.$_statusTimer)
      this.$callPluginAction('org.vue.widgets.actions.kill-port', {
        port: this.port
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@vue/cli-ui/src/style/imports"

.wrapper
  height 100%
  position relative
  padding $padding-item
  box-sizing border-box
  v-box()
  justify-content space-between

.status
  color $vue-ui-color-primary
  .icon
    position relative
    left (-($padding-item * 2))
    margin-right (-($padding-item * 2) + 4px)
    >>> svg
      fill @color
  .info
    font-size 24px
    font-weight lighter

.status-error
  .status
    color $vue-ui-color-danger
    .icon >>> svg
      fill @color

.status,
.actions
  h-box()
  box-center()

.input
  flex 1
  margin-right $padding-item
</style>
