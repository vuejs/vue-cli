<template>
  <VueDisable
    :disabled="!prompt.enabled"
    class="prompt prompt-confirm"
  >
    <VueSwitch
      :value="value(prompt.value)"
      class="extend-left"
      @update="value => answer(value)"
    >
      <ListItemInfo
        :name="$t(prompt.message)"
        :description="$t(prompt.description)"
        :link="prompt.link"
      />
    </VueSwitch>

    <PromptError :error="prompt.error"/>
  </VueDisable>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt
}
</script>

<style lang="stylus" scoped>
.prompt-confirm
  .vue-ui-switch
    padding $padding-item
    width 100%
    box-sizing border-box
</style>
