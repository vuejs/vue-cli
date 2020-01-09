const gql = require('graphql-tag')
// Connectors
const widgets = require('../connectors/widgets')

exports.types = gql`
extend type Query {
  widgetDefinitions: [WidgetDefinition]
  widgets: [Widget]
}

extend type Mutation {
  widgetAdd (input: WidgetAddInput!): Widget!
  widgetRemove (id: ID!): Widget
  widgetMove (input: WidgetMoveInput!): [Widget]!
  widgetConfigOpen (id: ID!): Widget!
  widgetConfigSave (id: ID!): Widget!
  widgetConfigReset (id: ID!): Widget!
}

type WidgetDefinition {
  id: ID!
  title: String!
  description: String
  longDescription: String
  link: String
  icon: String
  screenshot: String
  component: String!
  detailsComponent: String
  canAddMore: Boolean!
  hasConfigPrompts: Boolean!
  count: Int!
  maxCount: Int
  minWidth: Int!
  minHeight: Int!
  maxWidth: Int!
  maxHeight: Int!
  openDetailsButton: Boolean
}

type Widget {
  id: ID!
  definition: WidgetDefinition!
  x: Int!
  y: Int!
  width: Int!
  height: Int!
  prompts: [Prompt]
  config: JSON
  configured: Boolean!
}

input WidgetAddInput {
  definitionId: ID!
}

input WidgetMoveInput {
  id: ID!
  x: Int
  y: Int
  width: Int
  height: Int
}
`

exports.resolvers = {
  WidgetDefinition: {
    canAddMore: (definition, args, context) => widgets.canAddMore(definition, context),
    count: (definition, args, context) => widgets.getCount(definition.id)
  },

  Widget: {
    definition: (widget, args, context) => widgets.findDefinition(widget, context),
    prompts: (widget, args, context) => widgets.getConfigPrompts(widget, context)
  },

  Query: {
    widgetDefinitions: (root, args, context) => widgets.listDefinitions(context),
    widgets: (root, args, context) => widgets.list(context)
  },

  Mutation: {
    widgetAdd: (root, { input }, context) => widgets.add(input, context),
    widgetRemove: (root, { id }, context) => widgets.remove({ id }, context),
    widgetMove: (root, { input }, context) => widgets.move(input, context),
    widgetConfigOpen: (root, { id }, context) => widgets.openConfig({ id }, context),
    widgetConfigSave: (root, { id }, context) => widgets.saveConfig({ id }, context),
    widgetConfigReset: (root, { id }, context) => widgets.resetConfig({ id }, context)
  }
}
