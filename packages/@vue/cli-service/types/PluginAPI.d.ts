import { Service } from './Service';
import { ProjectOptions } from './ProjectOptions';
import WebpackDevServer from 'webpack-dev-server';
import { Configuration, Compiler } from 'webpack';
import ChainableWebpackConfig from 'webpack-chain';

interface RegisterCommandOptions {
  description: string;
  usage?: string;
  options?: Record<string, string>;
}

type RegisterCommandCallback = (
  args: Record<string, string>,
  rawArgs: string[],
) => Promise<any>;

export declare class PluginAPI {
  id: string;
  service: Service;
  /**
   * @param {string} id - Id of the plugin.
   * @param {Service} service - A vue-cli-service instance.
   */
  constructor (id: string, service: Service);

  get version(): string;

  assertVersion(range: number | string): void;
  getCwd(): string;

  /**
   * Resolve path for a project.
   *
   * @param {string} _path - Relative path from project root
   * @return {string} The resolved absolute path.
   */
  resolve (_path: string): string;

  /**
   * Check if the project has a given plugin.
   *
   * @param {string} id - Plugin id, can omit the (@vue/|vue-|@scope/vue)-cli-plugin- prefix
   * @return {boolean}
   */
  hasPlugin(id: string): boolean;

  /**
   * Register a command that will become available as `vue-cli-service [name]`.
   *
   * @param {string} name
   * @param {object} [opts]
   *   {
   *     description: string,
   *     usage: string,
   *     options: { [string]: string }
   *   }
   * @param {function} fn
   *   (args: { [string]: string }, rawArgs: string[]) => ?Promise
   */
  registerCommand(
    name: string,
    opts: RegisterCommandOptions,
    fn: RegisterCommandCallback,
  ): void

  /**
   * Register a function that will receive a chainable webpack config
   * the function is lazy and won't be called until `resolveWebpackConfig` is
   * called
   *
   * @param {function} fn
   */
  chainWebpack (fn: ProjectOptions['chainWebpack']): void;

  /**
   * Register
   * - a webpack configuration object that will be merged into the config
   * OR
   * - a function that will receive the raw webpack config.
   *   the function can either mutate the config directly or return an object
   *   that will be merged into the config.
   *
   * @param {object | function} fn
   */
  configureWebpack(fn: ProjectOptions['configureWebpack']): void;

  /**
   * Register a dev serve config function. It will receive the express `app`
   * instance of the dev server.
   *
   * @param {function} fn
   */
  configureDevServer(
    fn: (
      app: Express.Application,
      server: WebpackDevServer,
      compiler: Compiler
    ) => void
  ): void

  /**
   * Resolve the final raw webpack config, that will be passed to webpack.
   *
   * @param {ChainableWebpackConfig} [chainableConfig]
   * @return {object} Raw webpack config.
   */
  resolveWebpackConfig(chainableConfig: ChainableWebpackConfig): Configuration;

  /**
   * Resolve an intermediate chainable webpack config instance, which can be
   * further tweaked before generating the final raw webpack config.
   * You can call this multiple times to generate different branches of the
   * base webpack config.
   * See https://github.com/mozilla-neutrino/webpack-chain
   *
   * @return {ChainableWebpackConfig}
   */
  resolveChainableWebpackConfig(): ChainableWebpackConfig;

  /**
   * Generate a cache identifier from a number of variables
   */
  genCacheConfig(
    id: string,
    partialIdentifier: string,
    configFiles: string[]
  ): { cacheDirectory: string; cacheIdentifier: string };
}
