# Vue CLI - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working with the Vue CLI codebase.

## Project Overview

**Vue CLI** is the official command-line interface for scaffolding and managing Vue.js projects. The project is currently in **maintenance mode** (as of version 5.0.x), with new projects encouraged to use [create-vue](https://github.com/vuejs/create-vue) for Vite-based setups.

- **Repository**: https://github.com/vuejs/vue-cli
- **Documentation**: https://cli.vuejs.org/
- **Current Version**: 5.0.9
- **License**: MIT
- **Architecture**: Monorepo using Lerna + Yarn Workspaces

## Repository Structure

### Monorepo Layout

```
vue-cli/
├── packages/
│   ├── @vue/
│   │   ├── cli/                          # Main CLI tool (@vue/cli)
│   │   ├── cli-service/                  # Local dev server & build tool
│   │   ├── cli-shared-utils/            # Shared utilities across packages
│   │   ├── cli-test-utils/              # Testing utilities
│   │   ├── cli-ui/                       # Graphical UI for CLI
│   │   ├── cli-ui-addon-webpack/        # UI addon for webpack stats
│   │   ├── cli-ui-addon-widgets/        # UI widgets
│   │   ├── cli-init/                     # Legacy vue init command
│   │   ├── cli-overlay/                  # Error overlay for dev server
│   │   ├── babel-preset-app/            # Default Babel preset
│   │   └── cli-plugin-*/                 # Official plugins:
│   │       ├── cli-plugin-babel/
│   │       ├── cli-plugin-typescript/
│   │       ├── cli-plugin-eslint/
│   │       ├── cli-plugin-router/
│   │       ├── cli-plugin-vuex/
│   │       ├── cli-plugin-pwa/
│   │       ├── cli-plugin-unit-jest/
│   │       ├── cli-plugin-unit-mocha/
│   │       ├── cli-plugin-e2e-cypress/
│   │       ├── cli-plugin-e2e-nightwatch/
│   │       └── cli-plugin-e2e-webdriverio/
│   └── vue-cli-version-marker/          # Version marker package
├── scripts/                              # Build and automation scripts
├── docs/                                 # VitePress documentation
├── __mocks__/                           # Jest mocks
└── [config files]
```

### Key Packages

1. **@vue/cli** - The main CLI binary (`vue` command)
   - Entry point: `packages/@vue/cli/bin/vue.js`
   - Core logic: `packages/@vue/cli/lib/`
   - Commands: create, add, invoke, inspect, upgrade, migrate, etc.

2. **@vue/cli-service** - Local service for Vue projects
   - Entry point: `packages/@vue/cli-service/bin/vue-cli-service.js`
   - Main service: `packages/@vue/cli-service/lib/Service.js`
   - Built-in webpack configuration and dev server
   - Commands: serve, build, inspect

3. **@vue/cli-shared-utils** - Shared utilities
   - Logger, spinner, IPC, file operations
   - Used across all packages

4. **Plugins** - Follow naming convention `@vue/cli-plugin-<name>`
   - Each plugin can inject commands, webpack config, and dependencies
   - Generator API for scaffolding files

## Development Setup

### Prerequisites

- **Node.js**: ^12.0.0 || >= 14.0.0
- **Package Manager**: Yarn 1.22.11+ (REQUIRED - npm will not work due to workspaces)

### Initial Setup

```bash
# Install dependencies
yarn

# Link the CLI for local development
cd packages/@vue/cli
yarn link

# Return to root and create test projects
cd -
cd packages/test
vue create test-app
cd test-app
yarn serve
```

### Common Commands

```bash
# Run tests (full suite - slow)
yarn test

# Run specific test file
yarn test <filenameRegex>

# Run tests for specific packages
yarn test -p cli,cli-service
yarn test -p typescript  # For plugins, omit 'cli-plugin-' prefix

# Run tests in watch mode
yarn test --watch

# Lint and auto-fix
yarn lint

# Lint without fixing
yarn lint-without-fix

# Clean test artifacts
yarn clean

# Clean e2e test artifacts
yarn clean-e2e

# Sync dependencies across packages
yarn sync

# Bootstrap packages
yarn boot

# Build documentation
yarn docs        # Dev server
yarn docs:build  # Production build

# Check documentation links
yarn check-links

# Release (maintainers only)
yarn release
```

## Git Workflow

### Branch Strategy

The project follows a **Gitflow-inspired workflow**:

- **`dev`** - Main development branch (all PRs with code changes go here)
- **`master`** - Current stable release (documentation at cli.vuejs.org)
- **`next`** - Next major version (documentation at next.cli.vuejs.org)
- **`v2`, `v3`** - Archive branches for old versions

### Pull Request Guidelines

1. **Code changes** → Fork from `dev` branch
2. **Documentation only** → Fork from `master` or `next`
3. **Bug fixes for old versions** → Target the specific version branch

### Commit Convention

**IMPORTANT**: Commits must follow conventional commit format for automated changelog generation.

Format: `<type>(<scope>): <subject>`

Valid types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, missing semi-colons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `workflow` - Workflow improvements
- `ci` - CI/CD changes
- `chore` - Maintenance tasks
- `types` - TypeScript type definitions

Examples:
```
feat(compiler): add 'comments' option
fix(v-model): handle events on blur (close #28)
docs(readme): update installation instructions
```

Commit validation is enforced via git hook (`scripts/verifyCommitMsg.js`).

## Testing

### Test Framework

- **Framework**: Jest with Node.js environment
- **Config**: `jest.config.js`
- **Test Pattern**: `**/__tests__/**/*.spec.js`
- **Setup**: `scripts/testSetup.js`

### Testing Strategy

1. **Unit Tests**: Test individual functions and modules
2. **Integration Tests**: Test plugin generators and CLI commands
3. **E2E Tests**: Full project creation and build tests (SLOW)

### Testing Tips

- E2E tests perform full webpack builds - they're slow
- Use file regex to run specific tests during development
- Use `-p` flag to test specific packages
- `--onlyChanged` may not be accurate due to child processes
- Test utilities available in `@vue/cli-test-utils`

## Code Style & Linting

### ESLint Configuration

- **Config**: `.eslintrc.js`
- **Base**: `@vue/standard` (JavaScript Standard Style)
- **Auto-fix**: Enabled in lint-staged for pre-commit hook

### Style Rules

```javascript
{
  indent: 2 spaces (except MemberExpression)
  quotes: Single quotes (allow template literals and escape)
  quote-props: Off (optional)
  no-shadow: Error
}
```

### Git Hooks

Managed by **Yorkie**:

- **pre-commit**: Runs `lint-staged` (auto-fix .js and .vue files)
- **commit-msg**: Validates commit message format

## Package Development

### Plugin Structure

All plugins follow this structure:

```
cli-plugin-<name>/
├── index.js           # Service plugin (runtime)
├── generator/         # Project generator
│   ├── index.js      # Generator logic
│   └── template/     # File templates
├── prompts.js        # CLI prompts (optional)
├── ui.js             # UI integration (optional)
└── __tests__/        # Tests
```

### Generator API

Key files in `@vue/cli/lib/`:
- `Creator.js` - Orchestrates project creation
- `Generator.js` - Handles file generation
- `GeneratorAPI.js` - API exposed to plugin generators
- `PromptModuleAPI.js` - API for prompt modules

### Service Plugin API

Service plugins can:
- Register new commands
- Modify webpack configuration (via webpack-chain)
- Extend package.json
- Add/modify environment variables

Reference: `packages/@vue/cli-service/lib/Service.js`

## Architecture Patterns

### Key Design Patterns

1. **Plugin System**: Modular architecture with discoverable plugins
2. **Generator Pattern**: Template-based file generation with EJS
3. **Service Pattern**: Centralized service managing webpack and commands
4. **Prompt System**: Interactive CLI prompts using Inquirer.js
5. **Configuration Merging**: Deep merging of configurations with smart defaults

### Core Abstractions

- **Creator**: High-level project creation orchestrator
- **Generator**: Transforms plugin templates into project files
- **Service**: Runtime service for serving/building projects
- **PluginAPI**: Interface for plugins to interact with CLI

## Common Workflows

### Adding a New Feature

1. Identify the appropriate package(s)
2. Write tests first (TDD encouraged)
3. Implement the feature
4. Update documentation if user-facing
5. Ensure all tests pass
6. Follow commit conventions
7. Submit PR to `dev` branch

### Debugging

```bash
# Enable debug mode
DEBUG=vue-cli:* vue create my-app

# Debug specific module
DEBUG=vue-cli:Generator vue create my-app

# Test with actual project creation
cd packages/test
vue create debug-app
```

### Working with Dependencies

```bash
# Sync dependencies across workspace
yarn sync

# Add dependency to specific package
cd packages/@vue/cli
yarn add <package>

# Update all dependencies (careful!)
yarn upgrade-interactive --latest
```

## Important Files

### Root Configuration

- `package.json` - Workspace configuration, scripts
- `lerna.json` - Lerna configuration, versioning
- `jest.config.js` - Jest test configuration
- `.eslintrc.js` - ESLint rules
- `.editorconfig` - Editor configuration

### Scripts

- `scripts/bootstrap.js` - Symlink workspace packages
- `scripts/test.js` - Custom test runner
- `scripts/release.js` - Release automation
- `scripts/syncDeps.js` - Sync dependencies
- `scripts/genChangelog.js` - Generate CHANGELOG
- `scripts/verifyCommitMsg.js` - Commit message validation

## Documentation

### Structure

- Built with **VitePress** (Vite-powered static site generator)
- Source: `docs/` directory
- Config: `docs/.vitepress/`
- Supports i18n: English (default), Russian (`ru/`), Chinese (`zh/`)

### Documentation Sections

- `docs/guide/` - User guides
- `docs/config/` - Configuration reference
- `docs/core-plugins/` - Plugin documentation
- `docs/dev-guide/` - Developer guides
- `docs/migrations/` - Migration guides

## Dependencies Overview

### Build Tools

- **webpack 5** - Module bundler
- **webpack-chain** - Chainable webpack config API
- **webpack-dev-server 4** - Development server
- **Babel 7** - JavaScript transpiler
- **PostCSS** - CSS processing

### CLI Dependencies

- **commander** - CLI framework
- **inquirer** - Interactive prompts
- **chalk** - Terminal colors
- **execa** - Process execution
- **fs-extra** - Enhanced file system
- **globby** - File globbing

### Testing

- **Jest** - Test framework
- **@vue/cli-test-utils** - Custom test utilities

## Maintenance Mode Considerations

As the project is in maintenance mode:

1. **Focus on bug fixes** over new features
2. **Minimize breaking changes**
3. **Keep dependencies updated** for security
4. **Maintain documentation accuracy**
5. **Guide users to Vite/create-vue** for new projects
6. **Support migration paths** from Vue CLI to Vite

## Best Practices for AI Assistants

### When Making Changes

1. **Always run tests** before committing
   ```bash
   yarn test -p <affected-package>
   ```

2. **Follow existing patterns** - The codebase is mature and consistent

3. **Update TypeScript types** if modifying public APIs
   - Type definitions in `types/` directories

4. **Consider backward compatibility** - This is a widely-used tool

5. **Document breaking changes** clearly

6. **Test with real projects** in `packages/test/`

### Code Reading Tips

1. Start with the main entry points:
   - CLI: `packages/@vue/cli/bin/vue.js`
   - Service: `packages/@vue/cli-service/bin/vue-cli-service.js`

2. Follow the creator flow:
   - `lib/create.js` → `lib/Creator.js` → `lib/Generator.js`

3. Understand the plugin system:
   - Read a simple plugin like `cli-plugin-router`
   - Compare with complex ones like `cli-plugin-typescript`

4. Check tests for usage examples:
   - Tests often show the best way to use APIs

### Common Gotchas

1. **Yarn Workspaces Required**: Don't suggest using npm
2. **Node Version**: Respect the engine requirements
3. **Hoisting**: Workspace dependencies are hoisted to root `node_modules`
4. **Linking**: Use `yarn link` carefully - can cause version conflicts
5. **Generator Context**: Generators run in a special context with limited Node APIs
6. **Webpack Config**: Modify via webpack-chain, not direct config objects
7. **Async Operations**: Many operations are async - handle promises properly

## Troubleshooting

### Common Issues

**"Cannot find module" errors**
```bash
# Re-bootstrap workspace
yarn
yarn boot
```

**Test failures after pulling**
```bash
# Clean and re-run
yarn clean
yarn test
```

**Linked CLI not working**
```bash
# Re-link
cd packages/@vue/cli
yarn unlink
yarn link
```

**Workspace dependency issues**
```bash
# Force reinstall
rm -rf node_modules packages/*/node_modules
yarn
```

## Resources

- **Official Docs**: https://cli.vuejs.org/
- **Contributing Guide**: .github/CONTRIBUTING.md
- **Plugin Development**: https://cli.vuejs.org/dev-guide/plugin-dev.html
- **Migration to Vite**: https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/
- **Create Vue (Vite)**: https://github.com/vuejs/create-vue

## Quick Reference

### File Locations

| What | Where |
|------|-------|
| CLI entry point | `packages/@vue/cli/bin/vue.js` |
| Service entry point | `packages/@vue/cli-service/bin/vue-cli-service.js` |
| Creator logic | `packages/@vue/cli/lib/Creator.js` |
| Generator logic | `packages/@vue/cli/lib/Generator.js` |
| Service core | `packages/@vue/cli-service/lib/Service.js` |
| Shared utilities | `packages/@vue/cli-shared-utils/` |
| Plugin template | Any `cli-plugin-*/` directory |
| Test utilities | `packages/@vue/cli-test-utils/` |
| Documentation | `docs/` |
| Scripts | `scripts/` |

### Package Cross-References

Most packages depend on:
- `@vue/cli-shared-utils` - Shared utilities
- `webpack` - Build system
- Node.js >= 12.0.0

Plugins additionally depend on:
- `@vue/cli-service` - Service plugin API
- Generator may use template engines (EJS, etc.)

---

**Last Updated**: 2025-11-14
**Vue CLI Version**: 5.0.9
**Status**: Maintenance Mode
