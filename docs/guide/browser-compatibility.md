# Browser Compatibility

## browserslist

You will notice a `browserslist` field in `package.json` specifying a range of browsers the project is targeting. This value will be used by `babel-preset-env` and `autoprefixer` to automatically determine the JavaScript polyfills and CSS vendor prefixes needed.

See [here](https://github.com/ai/browserslist) for how to specify browser ranges.

::: tip Note on Vendor-prefixed CSS Rules
In the production build, Vue CLI optimizes your CSS and will drop unnecessary vendor-prefixed CSS rules based on your browser targets. With [autoprefixer](https://github.com/postcss/autoprefixer) enabled by default, you should always use only non-prefixed CSS rules.
:::

## Polyfills

## Modern Mode
