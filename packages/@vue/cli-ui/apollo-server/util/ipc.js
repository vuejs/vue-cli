const net = require('net')
const fs = require('fs')

// Utils
const { log, dumpObject } = require('../util/logger')
const { getPipePath, encodeIpcData, parseIpcData } = require('@vue/cli-shared-utils')

const id = process.env.VUE_CLI_IPC || 'vue-cli'

const listeners = []

const pipePath = getPipePath(id)

let curSocket = null

let reserveData = {
  contentLength: -1,
  rawData: ''
}

fs.unlink(pipePath, () => {
  const server = net.createServer((socket) => {
    curSocket = socket
    if (socket.setEncoding) {
      socket.setEncoding('utf-8')
    }

    socket.on('data', (massages) => {
      const queue = parseIpcData(massages, reserveData)
      queue.forEach(massage => {
        _onMessage(massage)
      })
    })

    socket.on('close', () => {
      if (curSocket && curSocket.destroy) {
        curSocket.destroy()
      }
      reserveData = {
        contentLength: -1,
        rawData: ''
      }
      curSocket = null
    })

    socket.on('error', (error) => {
      const massage = {
        type: 'error',
        data: error
      }
      _onMessage(massage)
    })
  })

  server.listen({
    path: pipePath
  })
})

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
  const massages = encodeIpcData('message', data)
  curSocket.write(massages)
}

function _onMessage (massage) {
  const { type, data } = massage
  if (type === 'ack') {
    log('IPC ack', dumpObject(data))
    if (data.done) {
      curSocket.write(encodeIpcData('ack', { ok: true }))
    }
  } else {
    log('IPC message', dumpObject(data))
    listeners.forEach((resolve, reject) => {
      if (type === 'error') {
        reject({
          data,
          emit: data => {
            curSocket.write(encodeIpcData('error', data))
          }
        })
      } else {
        resolve({
          data,
          emit: data => {
            curSocket.write(encodeIpcData('message', data))
          }
        })
      }
    })
  }
}

module.exports = {
  on,
  off,
  send
}
