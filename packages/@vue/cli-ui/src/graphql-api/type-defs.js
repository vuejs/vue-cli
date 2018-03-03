module.exports = `
# It will increment!
type Counter {
  # Number of increments
  count: Int!
  # Full message for testing
  countStr: String
}

# A text message send by users
type Message {
  id: ID!
  # Message content
  text: String!
}

# Input from user to create a message
input MessageInput {
  # Message content
  text: String!
}

scalar Upload

type File {
  id: ID!
  path: String!
  filename: String!
  mimetype: String!
  encoding: String!
}

type Query {
  # Test query with a parameter
  hello(name: String): String!
  # List of messages sent by users
  messages: [Message]
  uploads: [File]
}

type Mutation {
  # Add a message and publish it on 'messages' subscription channel
  messageAdd (input: MessageInput!): Message!
  singleUpload (file: Upload!): File!
  multipleUpload (files: [Upload!]!): [File!]!
}

type Subscription {
  # This will update every 2 seconds
  counter: Counter!
  # When a new message is added
  messageAdded: Message!
}
`
