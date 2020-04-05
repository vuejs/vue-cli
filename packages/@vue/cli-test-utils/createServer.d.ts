import http from 'http'

type Options = {
  [props: string]: any
  /**
   * Set a sub directory to be served
   */
  root: string
}

declare function createServer(options: Options): http.Server

export = createServer
