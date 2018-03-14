<template>
  <div class="prompt prompt-list">
    <div class="prompt-content">
      <ListItemInfo
        :name="prompt.message"
        :description="prompt.description"
        :link="prompt.link"
      />

      <div class="prompt-input">
        <VueSelect
          :value="value(prompt.value)"
          @input="value => answer(value)"
        >
          <VueSelectButton
            v-for="(choice, index) of prompt.choices"
            :key="index"
            :value="value(choice.value)"
            :label="choice.name"
          />
        </VueSelect>
      </div>
    </div>

    <PromptError :error="prompt.error"/>
  </div>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt
}
</script>
