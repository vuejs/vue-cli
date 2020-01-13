import { PluginAPI } from './PluginAPI';
import { ProjectOptions } from './ProjectOptions';
import ChainableWebpackConfig from 'webpack-chain';
import { WebpackOptions } from 'webpack/declarations/WebpackOptions'


interface ServicePlugin {
  id: string;
  apply: (api: PluginAPI, options: ProjectOptions) => void;
}

type Package = Record<string, any>;

interface ServiceOptions {
  plugins?: ServicePlugin[];
  pkg?: Package;
  inlineOptions?: ProjectOptions;
  useBuiltIn?: boolean;
}

export declare class Service {
  initialized: boolean;
  context: string;
  inlineOptions: ProjectOptions
  webpackChainFns: Array<ProjectOptions['chainWebpack']>;
  webpackRawConfigFns: Array<ProjectOptions['configureWebpack']>;
  devServerConfigFns: Array<ProjectOptions['devServer']>
  commands: Record<string, any>;
  pkgContext: string;
  pkg: Package;
  plugins: ServicePlugin[];
  pluginsToSkip: Set<any>;
  modes: Record<string, WebpackOptions['mode']>
  constructor(context: string, serviceOptions: ServiceOptions)
  resolvePkg(inlinePkg: Record<string, any>, context: string): Record<string, any>;
  init(mode: string): void;
  loadEnv(mode: string): void;
  setPluginsToSkip (args: Record<string, string[]>): void;
  resolvePlugins(inlinePlugins: ServicePlugin[], useBuiltIn: boolean): ServicePlugin[];
  run (name: string, args: Record<string, string>, rawArgv: string[]): Promise<any>;
  resolveChainableWebpackConfig(): ChainableWebpackConfig;
  resolveWebpackConfig(chainableConfig?: ChainableWebpackConfig): WebpackOptions;
  loadUserOptions(): ProjectOptions;
}
