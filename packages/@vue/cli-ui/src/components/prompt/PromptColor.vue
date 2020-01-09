<template>
  <VueDisable
    :disabled="!prompt.enabled"
    class="prompt prompt-color"
  >
    <div class="prompt-content">
      <ListItemInfo
        :name="$t(prompt.message)"
        :description="$t(prompt.description)"
        :link="prompt.link"
      />

      <VueDropdown
        class="prompt-input"
      >
        <VueInput
          slot="trigger"
          :value="value(prompt.value)"
          @update="value => answer(value)"
        >
          <div slot="right" class="color-preview">
            <div class="color-swatch" :style="{
              backgroundColor: value(prompt.value)
            }" />
          </div>
        </VueInput>

        <ColorPicker
          class="color-picker"
          :value="value(prompt.value)"
          @input="value => answer(value.hex)"
        />
      </VueDropdown>
    </div>

    <PromptError :error="prompt.error"/>
  </VueDisable>
</template>

<script>
import Prompt from './Prompt'
import { Sketch } from 'vue-color'

export default {
  extends: Prompt,

  components: {
    ColorPicker: Sketch
  },

  buffer: true
}
</script>

<style lang="stylus" scoped>
.color-preview
  padding-left $padding-item

.color-swatch
  width 18px
  height @width
  border-radius 50%

.color-picker
  width 300px !important
  height 370px !important
  background none
  box-shadow none
  padding ($padding-item - 4px) $padding-item

  >>> .vc-sketch-presets
    border-top-color rgba(black, .1)
</style>
