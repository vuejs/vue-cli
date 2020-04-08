import { GeneratorPlugin, PromptModuleAPI } from '@vue/cli'

const testPromptAPI = (cli: PromptModuleAPI) => {
  cli.injectFeature({
    name: 'Babel',
    value: 'babel',
    short: 'Babel',
    // descriptions: 'Transpile modern JavaScript to older versions (for compatibility)',
    // link: 'https://babeljs.io/',
    checked: true
  })

  cli.injectOptionForPrompt('customBar', {
    name: 'barChoice',
    value: 'barChoice'
  })
  cli.onPromptComplete<{ features: string[]; useTsWithBabel: boolean }>((answers, options) => {
    if (answers.features.includes('ts')) {
      if (!answers.useTsWithBabel) {
        return
      }
    } else if (!answers.features.includes('babel')) {
      return
    }
    options.plugins['@vue/cli-plugin-babel'] = {}
  })

  cli.injectFeature({
    name: 'CSS Pre-processors',
    value: 'css-preprocessor'
    // description: 'Add support for CSS pre-processors like Sass, Less or Stylus',
    // link: 'https://cli.vuejs.org/guide/css.html'
  })

  const notice = 'PostCSS, Autoprefixer and CSS Modules are supported by default'
  cli.injectPrompt<{ features: string[] }>({
    name: 'cssPreprocessor',
    when: answers => answers.features.includes('css-preprocessor'),
    type: 'list',
    message: `Pick a CSS pre-processor${process.env.VUE_CLI_API_MODE ? '' : ` (${notice})`}:`,
    // description: `${notice}.`,
    choices: [
      {
        name: 'Sass/SCSS (with dart-sass)',
        value: 'dart-sass'
      },
      {
        name: 'Sass/SCSS (with node-sass)',
        value: 'node-sass'
      },
      {
        name: 'Less',
        value: 'less'
      },
      {
        name: 'Stylus',
        value: 'stylus'
      }
    ]
  })
}

const generator: GeneratorPlugin = (api, options, rootOptions, invoking) => {
  const version = api.cliVersion
  const cliServiceVersion = api.cliServiceVersion
  api.assertCliServiceVersion(4)
  api.assertCliServiceVersion('^100')
  api.hasPlugin('eslint')
  api.hasPlugin('eslint', '^6.0.0')

  api.addConfigTransform('fooConfig', {
    file: {
      json: ['foo.config.json']
    }
  })

  api.extendPackage({
    fooConfig: {
      bar: 42
    },
    dependencies: {
      'vue-router-layout': '^0.1.2'
    }
  })
  api.extendPackage(() => ({
    fooConfig: {
      bar: 42
    },
    dependencies: {
      'vue-router-layout': '^0.1.2'
    }
  }))
  api.extendPackage(pkg => ({
    foo: pkg.foo + 1
  }))
  api.extendPackage(
    {
      fooConfig: {
        bar: 42
      },
      dependencies: {
        'vue-router-layout': '^0.1.2'
      }
    },
    true
  )
  api.extendPackage(
    {
      fooConfig: {
        bar: 42
      },
      dependencies: {
        'vue-router-layout': '^0.1.2'
      }
    },
    {
      merge: true,
      prune: true,
      warnIncompatibleVersions: true
    }
  )

  api.render('./template')

  api.render(
    './template',
    {
      hasTS: api.hasPlugin('typescript'),
      hasESLint: api.hasPlugin('eslint')
    },
    {
      strict: true,
      rmWhitespace: false
    }
  )

  api.render((files, render) => {
    files['foo2.js'] = render('foo(<%- n %>)', { n: 3 })
    files['bar/bar2.js'] = render('bar(<%- n %>)', { n: 3 }, { rmWhitespace: false })
  })

  api.postProcessFiles(files => {
    delete files['src/test.js']
  })

  api.onCreateComplete(() => {
    console.log('complete')
  })

  api.afterInvoke(() => {
    console.log('after invoke')
  })

  api.afterAnyInvoke(() => {
    console.log('after any invoke')
  })

  api.exitLog('msg')
  api.exitLog('msg', 'error')
  api.genJSConfig({ foo: 1 })

  api.extendPackage({
    vue: {
      publicPath: api.makeJSOnlyValue(`process.env.VUE_CONTEXT`)
    }
  })
  api.transformScript(
    'src/test.js',
    (fileInfo, api, { additionalData }) => {
      const j = api.jscodeshift
      const root = j(fileInfo.source)
      return root.toSource()
    },
    {
      additionalData: []
    }
  )

  api.injectImports('main.js', `import bar from 'bar'`)

  api.injectRootOptions('main.js', ['foo', 'bar'])

  api.resolve(api.entryFile)

  const isInvoking = api.invoking
}

export = generator
