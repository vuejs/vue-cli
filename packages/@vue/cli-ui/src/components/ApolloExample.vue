<template>
  <div class="apollo-example">
    <!-- Cute tiny form -->
    <div class="form">
      <input
        v-model="name"
        placeholder="Type a name"
        class="input"
      >
    </div>

    <!-- Apollo watched Graphql query -->
    <ApolloQuery
      :query="require('../graphql/HelloWorld.gql')"
      :variables="{ name }"
    >
      <template slot-scope="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

        <!-- No result -->
        <div v-else class="no-result apollo">No result :(</div>
      </template>
    </ApolloQuery>

    <!-- Tchat example -->
    <ApolloQuery
      :query="require('../graphql/Messages.gql')"
    >
      <ApolloSubscribeToMore
        :document="require('../graphql/MessageAdded.gql')"
        :update-query="onMessageAdded"
      />

      <div slot-scope="{ result: { data } }">
        <template v-if="data">
          <div
            v-for="message of data.messages"
            :key="message.id"
            class="message"
          >
            {{ message.text }}
          </div>
        </template>
      </div>
    </ApolloQuery>

    <div class="form">
      <input
        v-model="newMessage"
        placeholder="Type a message"
        class="input"
        @keyup.enter="sendMessage"
      >
    </div>
  </div>
</template>

<script>
import MESSAGE_ADD_MUTATION from '../graphql/MessageAdd.gql'

export default {
  data () {
    return {
      name: 'Anne',
      newMessage: ''
    }
  },

  computed: {
    formValid () {
      return this.newMessage
    }
  },

  methods: {
    sendMessage () {
      if (this.formValid) {
        this.$apollo.mutate({
          mutation: MESSAGE_ADD_MUTATION,
          variables: {
            input: {
              text: this.newMessage
            }
          }
        })

        this.newMessage = ''
      }
    },

    onMessageAdded (previousResult, { subscriptionData }) {
      return {
        messages: [
          ...previousResult.messages,
          subscriptionData.data.messageAdded
        ]
      }
    }
  }
}
</script>

<style scoped>
.form,
.input,
.apollo,
.message {
  padding: 12px;
}

.input {
  font-family: inherit;
  font-size: inherit;
  border: solid 2px #ccc;
  border-radius: 3px;
}

.error {
  color: red;
}
</style>
