import { GeneratorAPI, GeneratorRootOptions } from '@vue/cli'

type ApplyFn = (
  api: GeneratorAPI,
  options: Record<string, any>,
  rootOptions: GeneratorRootOptions,
  invoking: boolean,
) => any
interface Plugin {
  /** package name from plugin */
  id: string
  /** generator function from plugin */
  apply: ApplyFn
  /** parameter passed to generator function */
  options: Record<string, any>
}

/**
 * invoke generator function, and generate file tree in memory
 */
declare function generateWithPlugin(
  plugin: Plugin | Plugin[],
): Promise<{
  /** package.json Object */
  pkg: object
  /** virtual file tree, file path is the key of Object */
  files: {
    [filePath: string]: string | Buffer
  }
}>

export = generateWithPlugin
