<template>
  <div
    class="task-item list-item"
    :class="[
      `status-${task.status}`,
      {
        selected
      }
    ]"
    v-tooltip.right="description"
    @dblclick="runTask()"
  >
    <div class="content">
      <ItemLogo
        :image="logo ? `${logo}?project=${task.project.id}` : iconData.icon"
        :class="iconData.class"
        v-tooltip="status"
        color-bullet
      />

      <ListItemInfo
        :name="task.name"
        :description="description"
        :selected="selected"
      />

      <slot/>
    </div>
  </div>
</template>

<script>
import TASK_RUN from '@/graphql/task/taskRun.gql'

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
      return this.$t(`org.vue.types.task.status.${this.task.status}`)
    },

    iconData () {
      return icons[this.task.status]
    },

    logo () {
      return this.task.icon || (this.task.plugin && this.task.plugin.logo)
    },

    description () {
      return (this.task.status === 'idle' && this.$t(this.task.description)) || this.status
    }
  },

  methods: {
    runTask () {
      if (this.task.status === 'running') return
      this.$apollo.mutate({
        mutation: TASK_RUN,
        variables: {
          id: this.task.id
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.task-item
  padding $padding-item

  .content
    h-box()
    box-center()

  .list-item-info
    flex 100% 1 1
    width 0
    overflow hidden

    >>> .description
      white-space nowrap
      overflow hidden
      text-overflow ellipsis

  &.selected
    &.status-error .list-item-info >>> .name
      color $vue-ui-color-danger
    &.status-running .list-item-info >>> .name
      color $vue-ui-color-info
</style>
