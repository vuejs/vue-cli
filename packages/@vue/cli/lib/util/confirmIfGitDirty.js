const inquirer = require('inquirer')
const {
  execa,
  warn,
  hasProjectGit
} = require('@vue/cli-shared-utils')

module.exports = async function confirmIfGitDirty (context) {
  if (process.env.VUE_CLI_SKIP_DIRTY_GIT_PROMPT || process.env.VUE_CLI_API_MODE) {
    return true
  }

  process.env.VUE_CLI_SKIP_DIRTY_GIT_PROMPT = true

  if (!hasProjectGit(context)) {
    return true
  }

  const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: context })
  if (!stdout) {
    return true
  }

  warn(`There are uncommited changes in the current repository, it's recommended to commit or stash them first.`)
  const { ok } = await inquirer.prompt([
    {
      name: 'ok',
      type: 'confirm',
      message: 'Still proceed?',
      default: false
    }
  ])
  return ok
}
