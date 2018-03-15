<template>
  <div class="prompts-list">
    <div class="content">
      <component
        v-for="prompt of prompts"
        v-if="prompt.enabled"
        :key="prompt.id"
        :is="getModule(prompt)"
        :prompt="prompt"
        @answer="value => $emit('answer', { prompt, value })"
      />

      <div v-if="!prompts.length" class="vue-ui-empty">
        <VueIcon icon="check_circle" class="empty-icon"/>
        <span>{{ $t('components.prompts-list.empty') }}</span>
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
@import "~@/style/imports"

</style>
