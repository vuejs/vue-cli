// From https://github.com/FormidableLabs/webpack-dashboard/blob/7f99b31c5f00a7818d8129cb8a8fc6eb1b71799c/plugin/index.js
// Modified by Guillaume Chau (Akryum)

/* eslint-disable max-params, max-statements */
'use strict'

const path = require('path')
const webpack = require('webpack')
const { IpcMessenger } = require('@vue/cli-shared-utils')
const { analyzeBundle } = require('./analyzeBundle')

const ONE_SECOND = 1000
const FILENAME_QUERY_REGEXP = /\?.*$/

const ipc = new IpcMessenger()

function getTimeMessage (timer) {
  let time = Date.now() - timer

  if (time >= ONE_SECOND) {
    time /= ONE_SECOND
    time = Math.round(time)
    time += 's'
  } else {
    time += 'ms'
  }

  return ` (${time})`
}

class DashboardPlugin {
  constructor (options) {
    if (typeof options === 'function') {
      this.handler = options
    } else {
      options = options || {}
      this.handler = options.handler || null
      this.type = options.type
    }

    this.cleanup = this.cleanup.bind(this)

    this.watching = false
  }

  cleanup () {
    if (!this.watching) {
      this.handler = null
    }
    ipc.disconnect()
  }

  apply (compiler) {
    let handler = this.handler
    let timer

    let assetSources

    if (!handler) {
      ipc.connect()
      handler = data => ipc.send({
        webpackDashboardData: {
          type: this.type,
          value: data
        }
      })
    }

    let progressTime = Date.now()

    compiler.apply(
      new webpack.ProgressPlugin((percent, msg) => {
        const time = Date.now()
        if (time - progressTime > 100) {
          progressTime = time
          handler([
            {
              type: 'status',
              value: 'Compiling'
            },
            {
              type: 'progress',
              value: percent
            },
            {
              type: 'operations',
              value: msg + getTimeMessage(timer)
            }
          ])
        }
      })
    )

    compiler.plugin('watch-run', (c, done) => {
      this.watching = true
      done()
    })

    compiler.plugin('run', (c, done) => {
      this.watching = false
      done()
    })

    compiler.plugin('compile', () => {
      timer = Date.now()

      handler([
        {
          type: 'status',
          value: 'Compiling'
        }
      ])
    })

    compiler.plugin('invalid', () => {
      handler([
        {
          type: 'status',
          value: 'Invalidated'
        },
        {
          type: 'progress',
          value: 0
        },
        {
          type: 'operations',
          value: 'idle'
        }
      ])
    })

    compiler.plugin('failed', () => {
      handler([
        {
          type: 'status',
          value: 'Failed'
        },
        {
          type: 'operations',
          value: `idle${getTimeMessage(timer)}`
        }
      ])
    })

    compiler.plugin('after-emit', (compilation, done) => {
      assetSources = new Map()
      for (const name in compilation.assets) {
        const asset = compilation.assets[name]
        assetSources.set(name.replace(FILENAME_QUERY_REGEXP, ''), asset.source())
      }
      done()
    })

    compiler.plugin('done', stats => {
      let statsData = stats.toJson()
      // Sometimes all the information is located in `children` array
      if ((!statsData.assets || !statsData.assets.length) && statsData.children && statsData.children.length) {
        statsData = statsData.children[0]
      }

      const outputPath = compiler.options.output.path
      statsData.assets.forEach(asset => {
        // Removing query part from filename (yes, somebody uses it for some reason and Webpack supports it)
        asset.name = asset.name.replace(FILENAME_QUERY_REGEXP, '')
        asset.fullPath = path.join(outputPath, asset.name)
      })
      analyzeBundle(statsData, assetSources)

      const hasErrors = stats.hasErrors()

      handler([
        {
          type: 'status',
          value: hasErrors ? 'Failed' : 'Success'
        },
        {
          type: 'progress',
          value: 0
        },
        {
          type: 'operations',
          value: `idle${getTimeMessage(timer)}`
        },
        {
          type: 'stats',
          value: {
            errors: hasErrors,
            warnings: stats.hasWarnings(),
            data: statsData
          }
        }
      ])
      this.cleanup()
    })
  }
}

module.exports = DashboardPlugin
