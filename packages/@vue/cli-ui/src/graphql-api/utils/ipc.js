const ipc = require('node-ipc')

ipc.config.id = 'vue-cli'
ipc.config.retry = 1500
ipc.config.silent = true

const listeners = []

ipc.serve(() => {
  ipc.server.on('message', (data, socket) => {
    for (const listener of listeners) {
      listener({
        data,
        emit: data => {
          ipc.server.emit(socket, 'message', data)
        }
      })
    }
  })

  ipc.server.on('ack', (data, socket) => {
    if (data.done) {
      ipc.server.emit(socket, 'ack', { ok: true })
    }
  })
})

ipc.server.start()

function on (cb) {
  listeners.push(cb)
  return () => off(cb)
}

function off (cb) {
  const index = listeners.indexOf(cb)
  if (index !== -1) listeners.splice(index, 1)
}

function send (data) {
  ipc.server.broadcast('message', data)
}

module.exports = {
  on,
  off,
  send
}
