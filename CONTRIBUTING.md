# vue-cli contributing guide

## Issue Reporting Guidelines

- First identify where error is coming from. If it's occuring while running `vue` command then issue is indeed on
`vue-cli` so please report it here. If error appears when you run one of `npm run` scripts, problem originates
from a template you're using, [maybe one of the official ones](https://github.com/vuejs-templates). If so, please
open an issue on a template repository.

- Try to search for your issue, it may have already been answered or even fixed in the development branch.

## Development Setup

``` bash
npm install
bin/vue init <path-to-github-repo OR path-to-local-dir>
bin/vue list
```
