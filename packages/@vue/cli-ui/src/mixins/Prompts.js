import PROMPT_ANSWER from '@/graphql/prompt/promptAnswer.gql'

export default function ({
  field,
  query,
  variables = null,
  updateQuery = null,
  update = null
}) {
  // @vue/component
  return {
    computed: {
      configurationValid () {
        return this.visiblePrompts.filter(
          p =>
            p.error ||
            p.value === null ||
            JSON.parse(p.value) === ''
        ).length === 0
      },

      hasPromptsChanged () {
        return !!this.visiblePrompts.find(
          prompt => prompt.valueChanged
        )
      },

      visiblePrompts () {
        if (!this[field]) {
          return []
        }
        return this[field].prompts.filter(
          p => p.visible
        )
      }
    },

    watch: {
      hasPromptsChanged: {
        handler (value) {
          this.$emit('has-changes', value)
        },
        immediate: true
      }
    },

    methods: {
      async answerPrompt ({ prompt, value }) {
        await this.$apollo.mutate({
          mutation: PROMPT_ANSWER,
          variables: {
            input: {
              id: prompt.id,
              value: JSON.stringify(value)
            }
          },
          update: (store, { data: { promptAnswer } }) => {
            if (update) {
              update.call(this, store, promptAnswer)
              return
            }
            let vars = variables || this.$apollo.queries[field].options.variables || undefined
            if (typeof vars === 'function') {
              vars = vars.call(this)
            }
            const data = store.readQuery({ query, variables: vars })
            if (updateQuery) {
              updateQuery.call(this, data, promptAnswer)
            } else {
              data[field].prompts = promptAnswer
            }
            store.writeQuery({ query, variables: vars, data })
          }
        })
      }
    }
  }
}
