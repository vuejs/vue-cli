<template>
  <VueDisable
    :disabled="!prompt.enabled"
    class="prompt prompt-editor"
  >
    <div class="prompt-content vertical">
      <ListItemInfo
        :name="$t(prompt.message)"
        :description="$t(prompt.description)"
        :link="prompt.link"
      />

      <div class="prompt-input">
        <VueInput
          :value="value(prompt.value)"
          type="textarea"
          @update="value => answer(value)"
        />
      </div>
    </div>

    <PromptError :error="prompt.error"/>
  </VueDisable>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt,

  buffer: true
}
</script>

<style lang="stylus" scoped>
.vue-ui-input /deep/ > .content > .input-wrapper > textarea.input
  min-height 16em
</style>
