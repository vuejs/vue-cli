# Plugins

Vue CLI はプラグインベースのアーキテクチャを使用します。 新しく作成されたプロジェクトの `package.json` を調べると、 `@vue/cli-plugin-` で始まる依存関係が見つかります。プラグインは内部で利用している webpack の設定を変更し、コマンドを `vue-cli-service` に注入できます。プロジェクト作成のプロセス中に表示される機能のほとんどは、プラグインとして実装されます。

このセクションには、コア Vue CLI プラグインのドキュメントが含まれています。

- [Babel](babel.md)
- [TypeScript](typescript.md)
- [ESLint](eslint.md)
- [PWA](pwa.md)
- [Jest](unit-jest.md)
- [Mocha](unit-mocha.md)
- [Cypress](e2e-cypress.md)
- [Nightwatch](e2e-nightwatch.md)
