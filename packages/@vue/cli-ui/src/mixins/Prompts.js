import PROMPT_ANSWER from '../graphql/promptAnswer.gql'

export default function ({
  field,
  query
}) {
  // @vue/component
  return {
    computed: {
      configurationValid () {
        return this.enabledPrompts.filter(
          p =>
            p.error ||
            p.value === null ||
            JSON.parse(p.value) === ''
        ).length === 0
      },

      enabledPrompts () {
        if (!this[field]) {
          return []
        }
        return this[field].prompts.filter(
          p => p.enabled
        )
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
            const data = store.readQuery({ query })
            data[field].prompts = promptAnswer
            store.writeQuery({ query, data })
          }
        })
      }
    }
  }
}
