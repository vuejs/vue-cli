import { DistinctQuestion, CheckboxChoiceOptions, Answers, ChoiceOptions } from 'inquirer'
import { Parser, Transform } from 'jscodeshift'
import * as ejs from 'ejs'

interface RenderFile {
  [path: string]: string | Buffer
}

type FileMiddleware = (files: RenderFile, render: typeof ejs.render) => void
type PostProcessFilesCallback = (files: RenderFile) => void

type RenderSource = string | RenderFile

type TransformModule = Transform & {
  default?: Transform
  parser?: string | Parser
}
interface TransformOptions {
  [prop: string]: any
  parser?: string | Parser
}
interface __expressionFn {
  (): void
  __expression: string
}

interface OnPromptCompleteCb<T> {
  (
    answers: T,
    options: {
      useConfigFiles: boolean
      plugins: Record<string, any>
    }
  ): void
}
type ExtendPackageOptions =
  | {
      prune?: boolean
      merge?: boolean
      warnIncompatibleVersions?: boolean
    }
  | boolean

type Preset = Partial<{
  [props: string]: any
  bare: boolean
  projectName: string
  useConfigFiles: boolean
  plugins: Record<string, any>
  configs: Record<string, any>
  cssPreprocessor: 'sass' | 'dart-sass' | 'node-sass' | 'less' | 'stylus'
}>

declare class PromptModuleAPI {
  /** inject checkbox choice for feature prompt. */
  injectFeature<T = Answers>(feature: CheckboxChoiceOptions<T>): void

  injectPrompt<T = Answers>(prompt: DistinctQuestion<T>): void

  injectOptionForPrompt(name: string, option: ChoiceOptions): void

  /** run cb registered by prompt modules to finalize the preset. */
  onPromptComplete<T = Answers>(cb: OnPromptCompleteCb<T>): void
}

declare class GeneratorAPI {
  /**
   * Resolve path for a project.
   *
   * @param  _paths - A sequence of relative paths or path segments
   * @return The resolved absolute path, calculated based on the current project root.
   */
  resolve(..._paths: string[]): string

  readonly cliVersion: string

  assertCliVersion(range: number | string): void

  readonly cliServiceVersion: string

  assertCliServiceVersion(range: number | string): void

  /**
   * Check if the project has a given plugin.
   *
   * @param id - Plugin id, can omit the (@vue/|vue-|@scope/vue)-cli-plugin- prefix
   * @param version - Plugin version. Defaults to ''
   * @return `boolean`
   */
  hasPlugin(id: string, version?: string): boolean

  /**
   * Configure how config files are extracted.
   *
   * @param  key - Config key in package.json
   * @param  options - Options
   * @param  options.file - File descriptor
   * Used to search for existing file.
   * Each key is a file type (possible values: ['js', 'json', 'yaml', 'lines']).
   * The value is a list of filenames.
   * Example:
   * {
   *   js: ['.eslintrc.js'],
   *   json: ['.eslintrc.json', '.eslintrc']
   * }
   * By default, the first filename will be used to create the config file.
   */
  addConfigTransform(key: string, options: { file: { [type: string]: string[] } }): void

  /**
   * Extend the package.json of the project.
   * Also resolves dependency conflicts between plugins.
   * Tool configuration fields may be extracted into standalone files before
   * files are written to disk.
   *
   * @param fields - Fields to merge.
   * @param [options] - Options for extending / merging fields.
   * @param [options.prune=false] - Remove null or undefined fields
   *    from the object after merging.
   * @param [options.merge=true] deep-merge nested fields, note
   *    that dependency fields are always deep merged regardless of this option.
   * @param [options.warnIncompatibleVersions=true] Output warning
   *    if two dependency version ranges don't intersect.
   */
  extendPackage(
    fields: (pkg: Record<string, any>) => object,
    options?: ExtendPackageOptions
  ): void
  extendPackage<T extends object>(
    fields: T extends Function ? never : T,
    options?: ExtendPackageOptions
  ): void

  /**
   * Render template files into the virtual files tree object.
   *
   * @param source -
   *   Can be one of:
   *   - relative path to a directory;
   *   - Object hash of { sourceTemplate: targetFile } mappings;
   *   - a custom file middleware function.
   * @param [additionalData] - additional data available to templates.
   * @param [ejsOptions] - options for ejs.
   */
  render(source: RenderSource, additionalData?: object, ejsOptions?: ejs.Options): void
  render(source: FileMiddleware): void

  /**
   * Push a file middleware that will be applied after all normal file
   * middlewares have been applied.
   *
   * @param cb
   */
  postProcessFiles(cb: PostProcessFilesCallback): void

  /**
   * Push a callback to be called when the files have been written to disk.
   *
   * @param cb
   */
  onCreateComplete(cb: (...args: any[]) => any): void

  /**
   * same to `onCreateComplete`.
   *
   * @param cb
   */
  afterInvoke(cb: (...args: any[]) => any): void

  /**
   * Push a callback to be called when the files have been written to disk
   * from non invoked plugins
   *
   * @param cb
   */
  afterAnyInvoke(cb: (...args: any[]) => any): void

  /**
   * Add a message to be printed when the generator exits (after any other standard messages).
   *
   * @param msg String or value to print after the generation is completed
   * @param [type='log'] Type of message
   */
  exitLog(msg: any, type?: 'log' | 'info' | 'done' | 'warn' | 'error'): void

  /**
   * convenience method for generating a js config file from json
   */
  genJSConfig(value: any): string

  /**
   * Turns a string expression into executable JS for JS configs.
   * @param str JS expression as a string
   */
  makeJSOnlyValue(str: string): __expressionFn

  /**
   * Run codemod on a script file or the script part of a .vue file
   * @param file the path to the file to transform
   * @param codemod the codemod module to run
   * @param options additional options for the codemod
   */
  transformScript(file: string, codemod: TransformModule, options?: TransformOptions): void

  /**
   * Add import statements to a file.
   */
  injectImports(file: string, imports: string | string[]): void

  /**
   * Add options to the root Vue instance (detected by `new Vue`).
   */
  injectRootOptions(file: string, options: string | string[]): void

  /**
   * Get the entry file taking into account typescript.
   *
   */
  readonly entryFile: 'src/main.ts' | 'src/main.js'

  /**
   * Is the plugin being invoked?
   *
   */
  readonly invoking: boolean
}

/**
 * function exported by a generator
 * @param api - A GeneratorAPI instance
 * @param options - These options are resolved during the prompt phase of project creation,
 *    or loaded from a saved preset in ~/.vuerc
 * @param rootOptions - The entire preset will be passed
 * @param invoking - Is the plugin being invoked
 */
type GeneratorPlugin = (
  api: GeneratorAPI,
  options: any,
  rootOptions: Preset,
  invoking: boolean
) => any

export { PromptModuleAPI, GeneratorAPI, Preset, GeneratorPlugin }
