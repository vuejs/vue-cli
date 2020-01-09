<template>
  <div
    class="suggestion-bar-item"
    :class="{
      ping
    }"
    :style="{
      animationDelay: `${index * .5 + 1.5}s`
    }"
    v-set-size="'.wrapper'"
  >
    <div class="wrapper">
      <VueDropdown
        :disabled="!suggestion.message && !suggestion.link"
        placement="bottom-end"
        class="dropdown"
      >
        <VueButton
          slot="trigger"
          :label="$t(suggestion.label)"
          :loading="suggestion.busy"
          class="round"
          v-tooltip="$t('org.vue.components.suggestion-bar.suggestion')"
          @click="onTriggerClick()"
        />

        <div class="suggestion-details">
          <div class="info label">
            {{ $t(suggestion.label) }}
          </div>

          <div
            v-if="suggestion.message"
            class="info message"
            v-html="$t(suggestion.message)"
          />

          <div
            v-if="suggestion.image"
            class="info image"
          >
            <img :src="image" alt="image">
          </div>

          <div class="actions-bar">
            <VueButton
              v-if="suggestion.link"
              :href="suggestion.link"
              :label="$t('org.vue.components.list-item-info.more-info')"
              target="_blank"
              class="flat"
              icon-right="open_in_new"
            />
            <div class="vue-ui-spacer"/>
            <VueButton
              :label="$t('org.vue.components.suggestion-bar.modal.cancel')"
              icon-left="close"
              v-close-popover
            />
            <VueButton
              class="primary"
              :label="$t('org.vue.components.suggestion-bar.modal.continue')"
              icon-left="done"
              v-close-popover
              @click="activate(suggestion)"
            />
          </div>
        </div>
      </VueDropdown>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/util/image'

import SUGGESTION_ACTIVATE from '@/graphql/suggestion/suggestionActivate.gql'

export default {
  props: {
    suggestion: {
      type: Object,
      required: true
    },

    index: {
      type: Number,
      default: -1
    },

    ping: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    image () {
      return getImageUrl(this.suggestion.image)
    }
  },

  methods: {
    onTriggerClick () {
      if (!this.suggestion.message && !this.suggestion.link) {
        this.activate(this.suggestion)
      }
    },

    async activate (suggestion) {
      if (suggestion.actionLink) {
        const win = window.open(
          suggestion.actionLink,
          '_blank'
        )
        win.focus()
      } else {
        await this.$apollo.mutate({
          mutation: SUGGESTION_ACTIVATE,
          variables: {
            input: {
              id: suggestion.id
            }
          }
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.suggestion-details
  padding ($padding-item * 2 - 8px) ($padding-item * 2)
  box-sizing border-box
  width 440px !important

  .label
    font-size 20px

  .actions-bar
    padding 0
    margin-top ($padding-item * 3)

  .info
    &:not(:last-child)
      margin-bottom $padding-item

    &.image
      >>> img
        max-width 100%

.suggestion-bar-item
  margin-left $padding-item
  h-box()
  box-center()
  .wrapper
    width max-content
    box-sizing border-box

  &.ping:not(.suggestion-leave-active)
    animation ping .5s ease-in-out

.suggestion-enter-active,
.suggestion-leave-active
  transition all 1.5s $ease
  >>> .vue-ui-button
    transition all 1.5s $ease
    .content
      transition all .2s

.suggestion-enter-active
  >>> .vue-ui-button
    .content
      transition-delay .5s

.suggestion-enter,
.suggestion-leave-to
  width 0 !important
  opacity 0
  margin-left 0
  >>> .vue-ui-button
    transform scale(0)
    .content
      opacity 0

@keyframes ping
  0%,
  100%
    transform none
    filter none
  25%
    transform scale(1.1)
    filter brightness(120%)
</style>
