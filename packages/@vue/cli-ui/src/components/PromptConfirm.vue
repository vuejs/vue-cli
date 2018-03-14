<template>
  <div class="prompt prompt-confirm">
    <VueSwitch
      :value="value(prompt.value)"
      class="extend-left"
      @input="value => answer(value)"
    >
      <ListItemInfo
        :name="prompt.message"
        :description="prompt.description"
        :link="prompt.link"
      />
    </VueSwitch>

    <PromptError :error="prompt.error"/>
  </div>
</template>

<script>
import Prompt from './Prompt'

export default {
  extends: Prompt
}
</script>

<style lang="stylus" scoped>
@import "~@/style/imports"

.prompt-confirm
  .vue-switch
    padding $padding-item
    width 100%
    box-sizing border-box
</style>
