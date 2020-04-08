import execa = require('execa') // execa@1.0.0 needs @types/execa
import { Preset } from '@vue/cli'

/**
 * create project at path `cwd`
 */
declare function createTestProject(
  /**
   * project name
   */
  name: string,
  /**
   * manual preset used to generate project.
   *
   * Example:
   * {
   *  plugins: {
   *     '@vue/cli-plugin-babel': {}
   *  }
   * }
   */
  preset: Preset,
  /** `path.resolve(cwd, name)` will be the project's root directory */
  cwd?: string | null,
  /**
   * if init git repo
   *
   * Default:`true`
   */
  initGit?: boolean,
): Promise<{
  /** test project's root path */
  dir: string
  /** test if project contains the file */
  has: (file: string) => boolean
  /** read the content for the file */
  read: (file: string) => Promise<string>
  /** write file to project */
  write: (file: string, content: any) => Promise<void>
  /** execa command at root path of project  */
  run: (command: string, args?: ReadonlyArray<string>) => execa.ExecaChildProcess
  /** delete the file of project */
  rm: (file: string) => Promise<void>
}>

export = createTestProject
