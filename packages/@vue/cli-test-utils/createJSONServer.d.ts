import { Application } from 'express'

declare function createJSONServer(
  /**
   * Either a path to a json file (e.g. 'db.json') or an object in memory
   *
   * Default:
   *{
   *  'posts': [
   *    { 'id': 1, 'title': 'json-server', 'author': 'typicode' }
   *  ],
   *  'comments': [
   *    { 'id': 1, 'body': 'some comment', 'postId': 1 }
   *  ],
   *  'profile': { 'name': 'typicode' }
   *}
   */
  data?: string | object,
): Application

export = createJSONServer
