const net = require('net')
const path = require('path')

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

exports.NewIpcMessenger = class NewIpcMessenger {
  constructor (options = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)

    this.id = this.options.networkId

    // per the node-ipc documentation
    // TODO: windows socket path
    this.socketPath = path.join('/tmp/', `app.${this.id}`)

    this.connected = false
    this.connecting = false
    this.disconnecting = false
    this.queue = []
    this.listeners = []

    this.disconnectTimeout = 15000
    this.idleTimer = null

    // Prevent forced process exit
    // (or else ipc messages may not be sent before kill)
    process.exit = code => {
      process.exitCode = code
    }
  }

  checkConnection () {
    // TODO: not sure how to abstract this under the current implementation
  }

  send (data, type = 'message') {
    if (this.connected) {
      if (this.options.namespaceOnProject && PROJECT_ID) {
        data = {
          _projectId: PROJECT_ID,
          _data: data
        }
      }

      // the packet format is compatible with node-ipc default
      this._client.write(JSON.stringify({ type, data }) + '\f', 'utf8')

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
    if (this.connected || this.connecting) return

    this.connecting = true
    this.disconnecting = false

    // TODO: check the socketPath, unlink if existed
    // TODO: server side
    // net.createServer().listen(this.socketPath)

    // client side
    this._client = net.createConnection({ path: this.socketPath }, () => {
      this.connected = true
      this.connecting = false
      this.queue && this.queue.forEach(data => this.send(data))
      this.queue = []
    })
  }

  disconnect () {}

  on (listener) {
    this.listeners.push(listener)
  }

  off (listener) {
    const index = this.listeners.indexOf(listener)
    if (index !== -1) this.listeners.splice(index, 1)
  }

  _onMessage (data) {
    this.listeners.forEach(fn => {
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
