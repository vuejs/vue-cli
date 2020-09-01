import ChainableWebpackConfig = require('webpack-chain')
import { Configuration as WebpackOptions } from 'webpack'

type PageEntry = string | string[];

interface PageConfig {
  entry: PageEntry;
  [key: string]: any;
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

interface ProjectOptions {
  publicPath?: string;
  outputDir?: string;
  assetsDir?: string;
  indexPath?: string;
  filenameHashing?: boolean;
  runtimeCompiler?: boolean;
  transpileDependencies?: Array<string | RegExp>;
  productionSourceMap?: boolean;
  parallel?: boolean | number;
  devServer?: object;
  pages?: {
    [key: string]: PageEntry | PageConfig;
  };
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  integrity?: boolean;

  css?: CSSOptions;

  chainWebpack?: (config: ChainableWebpackConfig) => void;
  configureWebpack?: WebpackOptions | ((config: WebpackOptions) => (WebpackOptions | void));

  lintOnSave?: boolean | 'default' | 'warning' | 'error';
  pwa?: object;

  pluginOptions?: object;
}

type ConfigFunction = () => ProjectOptions

export { ProjectOptions, ConfigFunction }
