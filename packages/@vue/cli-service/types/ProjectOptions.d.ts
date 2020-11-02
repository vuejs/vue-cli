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
  /**
   * Default: `true`
   *
   * By default, only files that ends in `*.module.[ext]` are treated as CSS modules
   */
  requireModuleExtension?: boolean;
  /**
   * Default: `true`
   *
   * Whether to extract CSS in your components into a standalone CSS files (instead of inlined in JavaScript and injected dynamically)
   */
  extract?: boolean | ExtractOptions;
  /**
   * Default: `false`
   *
   * Whether to enable source maps for CSS. Setting this to `true` may affect build performance
   */
  sourceMap?: boolean;
  /**
   * Default: `{}`
   *
   * Pass options to CSS-related loaders
   */
  loaderOptions?: LoaderOptions;
}

interface ProjectOptions {
  /**
   * Default: `'/'`
   *
   * The base URL your application bundle will be deployed at
   */
  publicPath?: string;
  /**
   * Default: `'dist'`
   *
   * The directory where the production build files will be generated in when running `vue-cli-service build`
   */
  outputDir?: string;
  /**
   * Default: `''`
   *
   * A directory (relative to `outputDir`) to nest generated static assets (js, css, img, fonts) under
   */
  assetsDir?: string;
  /**
   * Default: `'index.html'`
   *
   * Specify the output path for the generated `index.html` (relative to `outputDir`). Can also be an absolute path
   */
  indexPath?: string;
  /**
   * Default: `true`
   *
   * By default, generated static assets contains hashes in their filenames for better caching control
   */
  filenameHashing?: boolean;
  /**
   * Default: `false`
   *
   * Whether to use the build of Vue core that includes the runtime compiler
   */
  runtimeCompiler?: boolean;
  /**
   * Default: `[]`
   *
   * If you want to explicitly transpile a dependency with Babel, you can list it in this option
   */
  transpileDependencies?: Array<string | RegExp>;
  /**
   * Default: `true`
   *
   * Setting this to `false` can speed up production builds if you don't need source maps for production
   */
  productionSourceMap?: boolean;
  /**
   * Default: `require('os').cpus().length > 1`
   *
   * Whether to use `thread-loader` for Babel or TypeScript transpilation
   */
  parallel?: boolean | number;
  /**
   * [All options for `webpack-dev-server`](https://webpack.js.org/configuration/dev-server/) are supported
   */
  devServer?: { proxy: string | object, [key: string]: any };
  /**
   * Default: `undefined`
   *
   * Build the app in multi-page mode
   */
  pages?: {
    [key: string]: PageEntry | PageConfig;
  };
  /**
   * Default: `undefined`
   *
   * Configure the `crossorigin` attribute on `<link rel="stylesheet">` and `<script>` tags in generated HTML
   */
  crossorigin?: '' | 'anonymous' | 'use-credentials';
  /**
   * Default: `false`
   *
   * Set to `true` to enable [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) (SRI) on `<link rel="stylesheet">` and `<script>` tags in generated HTML
   */
  integrity?: boolean;

  css?: CSSOptions;

  /**
   * A function that will receive an instance of `ChainableConfig` powered by [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain)
   */
  chainWebpack?: (config: ChainableWebpackConfig) => void;
  /**
   * Set webpack configuration.  If the value is `Object`, will be merged into config.  If value is `Function`, will receive current config as argument
   */
  configureWebpack?: WebpackOptions | ((config: WebpackOptions) => (WebpackOptions | void));

  /**
   * Default: `'default'`
   *
   * Whether to perform lint-on-save during development using [eslint-loader](https://github.com/webpack-contrib/eslint-loader)
   */
  lintOnSave?: boolean | 'default' | 'warning' | 'error';
  /**
   * Pass options to the [PWA Plugin](https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa)
   */
  pwa?: object;

  /**
   * This is an object that doesn't go through any schema validation, so it can be used to pass arbitrary options to 3rd party plugins
   */
  pluginOptions?: object;
}

type ConfigFunction = () => ProjectOptions

export { ProjectOptions, ConfigFunction }
