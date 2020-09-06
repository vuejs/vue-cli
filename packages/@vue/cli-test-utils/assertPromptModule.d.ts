import { PromptModuleAPI } from '@vue/cli'

interface CliPromptModule {
  (api: PromptModuleAPI): void
}

declare function assertPromptModule(
  module: CliPromptModule | CliPromptModule[],
  expectedPrompts: object[],
  expectedOptions: object,
  opts?: {
    pluginsOnly?: boolean
  },
): Promise<void>

export = assertPromptModule
