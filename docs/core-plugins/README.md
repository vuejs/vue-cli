# Plugins

Vue CLI uses a plugin-based architecture. If you inspect a newly created project's `package.json`, you will find dependencies that start with `@vue/cli-plugin-`. Plugins can modify the internal webpack configuration and inject commands to `vue-cli-service`. Most of the features listed during the project creation process are implemented as plugins.

This section contains documentation for core Vue CLI plugins:

- [Babel](babel.md)
- [TypeScript](typescript.md)
- [ESLint](eslint.md)
- [PWA](pwa.md)
- [Jest](unit-jest.md)
- [Mocha](unit-mocha.md)
- [Cypress](e2e-cypress.md)
- [Nightwatch](e2e-nightwatch.md)
