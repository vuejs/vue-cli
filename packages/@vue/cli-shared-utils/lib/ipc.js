const { getPipePath, encodeIpcData, parseIpcData } = require('./env')
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
    this.reserveData = {
      contentLength: -1,
      rawData: ''
    }
    this.socket = null

    this.connected = false
    this.connecting = false
    this.disconnected = false
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

      const massages = encodeIpcData(type, data)
      this.socket.write(massages)

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
    if (!this.socket) {
      return
    }
    this.connected = false
    this.disconnecting = false
    this.disconnected = true
    this.socket.destroy()
    this._reset()
  }

  _onMessage (massage) {
    let { type, data } = massage
    if (type === 'ack') {
      if (data.ok) {
        clearTimeout(this.ipcTimer)
        this._disconnect()
      }
    } else {
      this.listeners.forEach((resolve, reject) => {
        if (this.options.namespaceOnProject && data._projectId) {
          if (data._projectId === PROJECT_ID) {
            data = data._data
          } else {
            return
          }
        }
        if (type === 'error') {
          reject(data)
        } else {
          resolve(data)
        }
      })
    }
  }

  _connectTo () {
    const pipPath = getPipePath(this.id)
    const socket = net.createConnection({ path: pipPath })
    socket.setEncoding('utf-8')

    socket.on('connect', () => {
      this.connected = true
      this.connecting = false
      this.queue && this.queue.forEach(data => this.send(data))
      this.queue = null
    })

    socket.on('data', (massages) => {
      const queue = parseIpcData(massages, this.reserveData)
      queue.forEach(massage => {
        this._onMessage(massage)
      })
    })

    socket.on('close', () => {
      if (this.disconnected) {
        return
      }
      setTimeout(() => {
        if (this.disconnected) {
          this._disconnect()
          return
        }
        this._connectTo()
      }, this.retry)
    })

    socket.on('error', (error) => {
      const massage = {
        type: 'error',
        data: error
      }
      this._onMessage(massage)
    })

    this.socket = socket
  }
}
