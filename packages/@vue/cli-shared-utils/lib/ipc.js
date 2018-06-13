const ipc = require('node-ipc')

const defaultId = process.env.VUE_CLI_IPC || 'vue-cli'

exports.IpcMessenger = class IpcMessenger {
  constructor (id = defaultId) {
    ipc.config.id = this.id = id
    ipc.config.retry = 1500
    ipc.config.silent = true

    this.connected = false
    this.connecting = false
    this.disconnecting = false
    this.queue = null

    this.listeners = []

    this.disconnectTimeout = 15000

    // Prevent forced process exit
    // (or else ipc messages may not be sent before kill)
    process.exit = code => {
      process.exitCode = code
    }

    this._reset()
  }

  send (data, type = 'message') {
    if (this.connected) {
      ipc.of[this.id].emit(type, data)
    } else {
      this.queue.push(data)
    }
  }

  connect () {
    if (this.connected || this.connecting) return
    this.connecting = true
    this.disconnecting = false
    ipc.connectTo(this.id, () => {
      this.connected = true
      this.connecting = false
      this.queue && this.queue.forEach(data => this.send(data))
      this.queue = null

      ipc.of[this.id].on('message', this._onMessage)
    })
  }

  disconnect () {
    if (!this.connected || this.disconnecting) return
    this.disconnecting = true
    this.connecting = false

    const ipcTimer = setTimeout(() => {
      this._disconnect()
    }, this.disconnectTimeout)

    this.send({ done: true }, 'ack')

    ipc.of[this.id].on('ack', data => {
      if (data.ok) {
        clearTimeout(ipcTimer)
        this._disconnect()
      }
    })
  }

  on (listener) {
    this.listeners.push(listener)
  }

  off (listener) {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) this.listeners.splice(index, 1)
  }

  _reset () {
    this.queue = []
    this.connected = false
  }

  _disconnect () {
    this.connected = false
    this.disconnecting = false
    ipc.disconnect(this.id)
    this._reset()
  }

  _onMessage (data) {
    this.listeners.forEach(fn => fn(data))
  }
}
