const net = require('net')
const fs = require('fs')

// Utils
const { log, dumpObject } = require('../util/logger')
const { getIpcPath, encodeIpcData, decodeIpcData } = require('@vue/cli-shared-utils')

const id = process.env.VUE_CLI_IPC || 'vue-cli'

const listeners = []
let ipcSocket = null

function start () {
  const ipcPath = getIpcPath(id)

  fs.unlink(ipcPath, () => {
    const server = net.createServer((socket) => {
      ipcSocket = socket
      if (socket.setEncoding) {
        socket.setEncoding('utf-8')
      }

      socket.on('data', (data) => {
        const messages = decodeIpcData(data)
        messages.forEach(message => {
          _onMessage(message, socket)
        })
      })

      socket.on('close', () => {
        if (socket && socket.destroy) {
          socket.destroy()
        }
        ipcSocket = null
      })

      socket.on('error', (error) => {
        _onMessage({
          type: 'error',
          data: error
        }, socket)
      })
    })

    server.listen({
      path: ipcPath
    })
  })
}

function _onMessage (massage, socket) {
  const { type, data } = massage
  if (type === 'ack') {
    log('IPC ack', dumpObject(data))
    if (data.done) {
      socket.write(encodeIpcData('ack', { ok: true }))
    }
  } else if (type === 'message') {
    log('IPC message', dumpObject(data))
    for (const listener of listeners) {
      listener({
        data,
        emit: data => {
          socket.write(encodeIpcData('message', data))
        }
      })
    }
  }
}

start()

function on (cb) {
  listeners.push(cb)
  return () => off(cb)
}

function off (cb) {
  const index = listeners.indexOf(cb)
  if (index !== -1) listeners.splice(index, 1)
}

function send (data) {
  log('IPC send', dumpObject(data))
  const message = encodeIpcData('message', data)
  if (ipcSocket) {
    ipcSocket.write(message)
  }
}

module.exports = {
  on,
  off,
  send
}
