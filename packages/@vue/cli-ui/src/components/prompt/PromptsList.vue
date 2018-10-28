<template>
  <div class="prompts-list">
    <div class="content">
      <div
        v-for="group of groups"
        :key="group.id"
        class="group"
      >
        <div v-if="group.id" class="group-name">{{ $t(group.id) }}</div>

        <component
          v-for="prompt of group.prompts"
          v-if="prompt.visible"
          :key="prompt.id"
          :is="getModule(prompt)"
          :prompt="prompt"
          @answer="value => $emit('answer', { prompt, value })"
        />
      </div>

      <div v-if="!prompts.length" class="vue-ui-empty">
        <VueIcon icon="check_circle" class="empty-icon"/>
        <span>{{ $t('org.vue.components.prompts-list.empty') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const types = {
  rawlist: 'list',
  password: 'input'
}

export default {
  props: {
    prompts: {
      type: Array,
      required: true
    }
  },

  computed: {
    groups () {
      const groupMap = {}
      const groups = []
      this.prompts.forEach(prompt => {
        let group = groupMap[prompt.group]
        if (!group) {
          group = groupMap[prompt.group] = {
            id: prompt.group,
            prompts: []
          }
          groups.push(group)
        }
        group.prompts.push(prompt)
      })
      return groups
    }
  },

  methods: {
    getModule (prompt) {
      let type = prompt.type
      if (types[type]) {
        type = types[type]
      }
      type = type.charAt(0).toUpperCase() + type.substr(1)
      return require(`./Prompt${type}.vue`).default
    }
  }
}
</script>

<style lang="stylus" scoped>
.group
  margin-bottom ($padding-item * 2)

.group-name
  padding $padding-item $padding-item ($padding-item / 2)
  font-size 1.6em
  font-weight lighter
  color $vue-ui-color-accent
  .vue-ui-dark-mode &
    color lighten($vue-ui-color-accent, 60%)
</style>
