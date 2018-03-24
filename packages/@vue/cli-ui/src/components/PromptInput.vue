<template>
  <VueDisable
    :disabled="!prompt.enabled"
    class="prompt prompt-input"
  >
    <div class="prompt-content">
      <ListItemInfo
        :name="prompt.message"
        :description="prompt.description"
        :link="prompt.link"
      />

      <div class="prompt-input">
        <VueInput
          :value="value(prompt.value)"
          :type="prompt.type === 'password' ? 'password' : 'text'"
          @input="value => answer(value)"
        />
      </div>
    </div>

    <PromptError :error="prompt.error"/>
  </VueDisable>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt
}
</script>
