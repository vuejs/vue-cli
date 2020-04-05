import { Application } from 'express'

declare function createJSONServer(
  /**
   * Either a path to a json file (e.g. 'db.json') or an object in memory
   */
  data?: string | object,
): Application

export = createJSONServer
