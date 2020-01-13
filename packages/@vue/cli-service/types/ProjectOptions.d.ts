import ChainableWebpackConfig from 'webpack-chain'
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration } from 'webpack-dev-server';
import { DeepPartial } from 'utility-types';

type PageEntry = string | string[];

interface PageConfig {
  entry: PageEntry;
  template?: string;
  filename?: string;
  title?: string;
  chunks?: string[];
}

interface LoaderOptions {
  css?: object;
  sass?: object;
  less?: object;
  stylus?: object;
  postcss?: object;
}

// mini-css-extract-plugin options
interface ExtractOptions {
  filename?: string;
  chunkFilename?: string;
}

interface CSSOptions {
  requireModuleExtension?: boolean;
  extract?: boolean | ExtractOptions;
  sourceMap?: boolean;
  loaderOptions?: LoaderOptions;
}

// export to fix "Default export of the module has or is using private name"
export interface DefaultProjectOptions {
  publicPath: string;
  outputDir: string;
  assetsDir: string;
  indexPath: string;
  filenameHashing: boolean;
  runtimeCompiler: boolean;
  transpileDependencies: Array<string | RegExp>;
  productionSourceMap: boolean;
  parallel: boolean;
  devServer: Configuration,
  pages?: Record<string, PageEntry | PageConfig>,
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  integrity: boolean;
  // css
  css?: CSSOptions

  // webpack
  chainWebpack?: (config: ChainableWebpackConfig) => void;
  configureWebpack?: WebpackConfiguration | ((config: WebpackConfiguration) => (WebpackConfiguration | void));

  // known runtime options for built-in plugins
  lintOnSave?: boolean | 'default' | 'warning' | 'error';
  pwa?: Record<string, any>;

  // 3rd party plugin options
  pluginOptions?: object;
}

export type ProjectOptions = DeepPartial<DefaultProjectOptions>;

export type ConfigFunction = () => ProjectOptions