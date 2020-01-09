<template>
  <VueDisable
    :disabled="!prompt.enabled"
    class="prompt prompt-list"
  >
    <div class="prompt-content">
      <ListItemInfo
        :name="$t(prompt.message)"
        :description="$t(prompt.description)"
        :link="prompt.link"
      />

      <div class="prompt-input">
        <VueSelect
          :value="value(prompt.value)"
          @update="value => answer(value)"
        >
          <VueSelectButton
            v-for="(choice, index) of prompt.choices"
            :key="index"
            :value="value(choice.value)"
            :label="generateLabel(choice)"
          />
        </VueSelect>
      </div>
    </div>

    <PromptError :error="prompt.error"/>
  </VueDisable>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt,

  methods: {
    generateLabel (choice) {
      let label = this.$t(choice.name)
      if (choice.isDefault) {
        label += ` (${this.$t('org.vue.components.prompt-list.default')})`
      }
      return label
    }
  }
}
</script>
