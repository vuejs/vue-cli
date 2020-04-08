import { GeneratorAPI, Preset } from '@vue/cli'

type ApplyFn = (
  api: GeneratorAPI,
  options: any,
  rootOptions: Preset,
  invoking: boolean,
) => any
interface Plugin {
  /** package name from plugin */
  id: string
  /** generator function from plugin */
  apply: ApplyFn
  /** parameter passed to generator function */
  options?: any
}

/**
 * invoke generator function, and generate file tree in memory
 */
declare function generateWithPlugin(
  plugin: Plugin | Plugin[],
): Promise<{
  /** package.json Object */
  pkg: Record<string, any>
  /** virtual file tree, file path is the key of Object */
  files: {
    [filePath: string]: string | Buffer
  }
}>

export = generateWithPlugin
