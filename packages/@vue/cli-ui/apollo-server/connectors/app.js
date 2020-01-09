const channels = require('../channels')

function requestRoute (route, context) {
  context.pubsub.publish(channels.ROUTE_REQUESTED, { routeRequested: route })
}

module.exports = {
  requestRoute
}
