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
    </div>
  </div>
</template>

<script>
export default {
  props: {
    prompts: {
      type: Array,
      required: true
    }
  },

  methods: {
    getModule (prompt) {
      const type = prompt.type.charAt(0).toUpperCase() + prompt.type.substr(1)
      return require(`./Prompt${type}.vue`).default
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

</style>
