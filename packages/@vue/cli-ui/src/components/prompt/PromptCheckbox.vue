<template>
  <VueDisable
    :disabled="!prompt.enabled"
    class="prompt prompt-checkbox"
  >
    <div class="prompt-content">
      <ListItemInfo
        :name="$t(prompt.message)"
        :description="$t(prompt.description)"
        :link="prompt.link"
      />

      <VueSwitch
        v-for="(choice, index) of prompt.choices"
        :key="index"
        :value="isCheckboxSelected(choice)"
        :disabled="choice.disabled"
        class="right"
        @update="value => asnwerCheckbox(choice, value)"
      >
        {{ $t(choice.name) }}
      </VueSwitch>
    </div>

    <PromptError :error="prompt.error"/>
  </VueDisable>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt,

  computed: {
    checkboxValue () {
      return this.value(this.prompt.value)
    }
  },

  methods: {
    isCheckboxSelected (choice) {
      return this.checkboxValue && this.checkboxValue.includes(this.value(choice.value))
    },

    asnwerCheckbox (choice, value) {
      let list = this.checkboxValue
      const choiceValue = this.value(choice.value)
      if (value) {
        list.push(choiceValue)
      } else {
        const index = list.indexOf(choiceValue)
        if (index !== -1) list.splice(index, 1)
      }
      this.answer(list)
    }
  }
}
</script>

<style lang="stylus" scoped>
.prompt-content
  v-box()
  align-items stretch

  .vue-ui-switch
    margin-top 6px
</style>
