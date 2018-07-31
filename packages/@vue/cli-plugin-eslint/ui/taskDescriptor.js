const task = {
  match: /vue-cli-service lint/,
  description: 'org.vue.eslint.tasks.lint.description',
  link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint#injected-commands',
  prompts: [
    {
      name: 'noFix',
      type: 'confirm',
      default: false,
      description: 'org.vue.eslint.tasks.lint.noFix'
    }
  ],
  onBeforeRun: ({ answers, args }) => {
    if (answers.noFix) args.push('--no-fix')
  }
}

module.exports = {
  task
}
