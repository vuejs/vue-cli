const { getIpcPath, encodeIpcData, decodeIpcData } = require('./env')
const net = require('net')

const DEFAULT_ID = process.env.VUE_CLI_IPC || 'vue-cli'
const DEFAULT_IDLE_TIMEOUT = 3000
const DEFAULT_OPTIONS = {
  networkId: DEFAULT_ID,
  autoConnect: true,
  disconnectOnIdle: false,
  idleTimeout: DEFAULT_IDLE_TIMEOUT,
  namespaceOnProject: true
}

const PROJECT_ID = process.env.VUE_CLI_PROJECT_ID

exports.IpcMessenger = class IpcMessenger {
  constructor (options = {}) {
    options = Object.assign({}, DEFAULT_OPTIONS, options)
    this.id = options.networkId
    this.retry = 1500
    this.ipcTimer = null
    this.socket = null

    this.connected = false
    this.connecting = false
    this.explicitlyDisconnected = false
    this.disconnecting = false
    this.queue = null
    this.options = options

    this.listeners = []

    this.disconnectTimeout = 15000
    this.idleTimer = null

    // Prevent forced process exit
    // (or else ipc messages may not be sent before kill)
    process.exit = code => {
      process.exitCode = code
    }

    this._reset()
  }

  checkConnection () {
    if (!this.socket) {
      this.connected = false
    }
  }

  send (data, type = 'message') {
    this.checkConnection()
    if (this.connected) {
      if (this.options.namespaceOnProject && PROJECT_ID) {
        data = {
          _projectId: PROJECT_ID,
          _data: data
        }
      }

      const message = encodeIpcData(type, data)
      this.socket.write(message)

      clearTimeout(this.idleTimer)
      if (this.options.disconnectOnIdle) {
        this.idleTimer = setTimeout(() => {
          this.disconnect()
        }, this.options.idleTimeout)
      }
    } else {
      this.queue.push(data)
      if (this.options.autoConnect && !this.connecting) {
        this.connect()
      }
    }
  }

  connect () {
    this.checkConnection()
    if (this.connected || this.connecting) return
    this.connecting = true
    this.disconnecting = false
    this._connectTo()
  }

  disconnect () {
    this.checkConnection()
    if (!this.connected || this.disconnecting) return
    this.disconnecting = true
    this.connecting = false
    this.explicitlyDisconnected = true

    this.ipcTimer = setTimeout(() => {
      this._disconnect()
    }, this.disconnectTimeout)

    this.send({ done: true }, 'ack')
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
    this.socket = null
  }

  _disconnect () {
    this.connected = false
    this.disconnecting = false
    if (this.socket) {
      this.socket.destroy()
    }
    this._reset()
  }

  _onMessage (message) {
    let { type, data } = message
    if (type === 'ack') {
      if (data.ok) {
        clearTimeout(this.ipcTimer)
        this._disconnect()
      }
    } else if (type === 'message') {
      this.listeners.forEach((fn) => {
        if (this.options.namespaceOnProject && data._projectId) {
          if (data._projectId === PROJECT_ID) {
            data = data._data
          } else {
            return
          }
        }
        fn(data)
      })
    }
  }

  _connectTo () {
    const ipcPath = getIpcPath(this.id)
    const socket = net.createConnection({ path: ipcPath })
    socket.setEncoding('utf-8')

    socket.on('connect', () => {
      this.connected = true
      this.connecting = false
      this.queue && this.queue.forEach(data => this.send(data))
      this.queue = null
    })

    socket.on('data', (data) => {
      const messages = decodeIpcData(data)
      messages.forEach(message => {
        this._onMessage(message)
      })
    })

    socket.on('close', () => {
      if (this.explicitlyDisconnected) {
        this._disconnect()
        return
      }
      setTimeout(() => {
        this._connectTo()
      }, this.retry)
    })

    socket.on('error', (err) => {
      this._onMessage({
        type: 'error',
        data: err
      })
    })

    this.socket = socket
  }
}
