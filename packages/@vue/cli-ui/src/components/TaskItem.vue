<template>
  <div
    class="task-item list-item"
    :class="{
      selected
    }"
  >
    <div class="content">
      <ItemLogo
        :icon="iconData.icon"
        :class="iconData.class"
        v-tooltip="status"
      />

      <ListItemInfo
        :name="task.name"
        :description="task.description || status"
        :selected="selected"
      />
    </div>
  </div>
</template>

<script>
const icons = {
  idle: { icon: 'assignment', class: '' },
  running: { icon: 'more_horiz', class: 'info' },
  done: { icon: 'check_circle', class: 'success' },
  error: { icon: 'error', class: 'danger' },
  terminated: { icon: 'error', class: '' }
}

export default {
  props: {
    task: {
      type: Object,
      required: true
    },

    selected: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    status () {
      return this.$t(`types.task.status.${this.task.status}`)
    },

    iconData () {
      return icons[this.task.status]
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.task-item
  padding $padding-item

  .content
    h-box()
    box-center()

  .list-item-info
    flex 100% 1 1
    width 0
</style>
