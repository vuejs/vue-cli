/// <reference types="node" />
import * as http from 'http'

declare function createServer(options: {
  /**
   * Set a sub directory to be served
   */
  root: string
}): http.Server

export = createServer
