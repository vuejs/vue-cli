const execa = require('execa')
const chalk = require('chalk')
// Subs
const channels = require('../channels')
// Connectors
const cwd = require('./cwd')
const folders = require('./folders')
const logs = require('./logs')
const plugins = require('./plugins')
const prompts = require('./prompts')
const views = require('./views')
const projects = require('./projects')
// Utils
const { log } = require('../util/logger')
const { notify } = require('../util/notification')
const { terminate } = require('../util/terminate')

const MAX_LOGS = 2000
const VIEW_ID = 'vue-project-tasks'
const WIN_ENOENT_THRESHOLD = 500 // ms

const tasks = new Map()

function getTasks (file = null) {
  if (!file) file = cwd.get()
  let list = tasks.get(file)
  if (!list) {
    list = []
    tasks.set(file, list)
  }
  return list
}

async function list ({ file = null, api = true } = {}, context) {
  if (!file) file = cwd.get()
  let list = getTasks(file)
  const pkg = folders.readPackage(file, context)
  if (pkg.scripts) {
    const existing = new Map()

    if (projects.getType(file, context) === 'vue') {
      await plugins.list(file, context, { resetApi: false, lightApi: true })
    }

    const pluginApi = api && plugins.getApi(file)

    // Get current valid tasks in project `package.json`
    let currentTasks = Object.keys(pkg.scripts).map(
      name => {
        const id = `${file}:${name}`
        existing.set(id, true)
        const command = pkg.scripts[name]
        const moreData = pluginApi ? pluginApi.getDescribedTask(command) : null
        return {
          id,
          name,
          command,
          index: list.findIndex(t => t.id === id),
          prompts: [],
          views: [],
          path: file,
          ...moreData
        }
      }
    )

    if (api && pluginApi) {
      currentTasks = currentTasks.concat(plugins.getApi(file).addedTasks.map(
        task => {
          const id = `${file}:${task.name}`
          existing.set(id, true)
          return {
            id,
            index: list.findIndex(t => t.id === id),
            prompts: [],
            views: [],
            path: file,
            uiOnly: true,
            ...task
          }
        }
      ))
    }

    // Process existing tasks
    const existingTasks = currentTasks.filter(
      task => task.index !== -1
    )
    // Update tasks data
    existingTasks.forEach(task => {
      Object.assign(list[task.index], task)
    })

    // Process removed tasks
    const removedTasks = list.filter(
      t => currentTasks.findIndex(c => c.id === t.id) === -1
    )
    // Remove badges
    removedTasks.forEach(task => {
      updateViewBadges({ task }, context)
    })

    // Process new tasks
    const newTasks = currentTasks.filter(
      task => task.index === -1
    ).map(
      task => ({
        ...task,
        status: 'idle',
        child: null,
        logs: []
      })
    )

    // Keep existing running tasks
    list = list.filter(
      task => existing.get(task.id) ||
      task.status === 'running'
    )

    // Add the new tasks
    list = list.concat(newTasks)

    tasks.set(file, list)
  }
  return list
}

function findOne (id, context) {
  for (const [, list] of tasks) {
    const result = list.find(t => t.id === id)
    if (result) return result
  }
}

function getSavedData (id, context) {
  let data = context.db.get('tasks').find({
    id
  }).value()
  // Clone
  if (data != null) data = JSON.parse(JSON.stringify(data))
  return data
}

function updateSavedData (data, context) {
  if (getSavedData(data.id, context)) {
    context.db.get('tasks').find({ id: data.id }).assign(data).write()
  } else {
    context.db.get('tasks').push(data).write()
  }
}

function getPrompts (id, context) {
  return restoreParameters({ id }, context)
}

function updateOne (data, context) {
  const task = findOne(data.id)
  if (task) {
    if (task.status !== data.status) {
      updateViewBadges({
        task,
        data
      }, context)
    }

    Object.assign(task, data)
    context.pubsub.publish(channels.TASK_CHANGED, {
      taskChanged: task
    })
  }
  return task
}

function updateViewBadges ({ task, data }, context) {
  const viewId = VIEW_ID

  // New badges
  if (data) {
    if (data.status === 'error') {
      views.addBadge({
        viewId,
        badge: {
          id: 'vue-task-error',
          type: 'error',
          label: 'org.vue.components.view-badge.labels.tasks.error',
          priority: 3
        }
      }, context)
    } else if (data.status === 'running') {
      views.addBadge({
        viewId,
        badge: {
          id: 'vue-task-running',
          type: 'info',
          label: 'org.vue.components.view-badge.labels.tasks.running',
          priority: 2
        }
      }, context)
    } else if (data.status === 'done') {
      views.addBadge({
        viewId,
        badge: {
          id: 'vue-task-done',
          type: 'success',
          label: 'org.vue.components.view-badge.labels.tasks.done',
          priority: 1,
          hidden: true
        }
      }, context)
    }
  }

  // Remove previous badges
  if (task.status === 'error') {
    views.removeBadge({ viewId, badgeId: 'vue-task-error' }, context)
  } else if (task.status === 'running') {
    views.removeBadge({ viewId, badgeId: 'vue-task-running' }, context)
  } else if (task.status === 'done') {
    views.removeBadge({ viewId, badgeId: 'vue-task-done' }, context)
  }
}

async function run (id, context) {
  const task = findOne(id, context)
  if (task && task.status !== 'running') {
    task._terminating = false

    // Answers
    const answers = prompts.getAnswers()
    let args = []
    let command = task.command

    // Process command containing args
    if (command.indexOf(' ')) {
      const parts = command.split(/\s+/)
      command = parts.shift()
      args = parts
    }

    // Output colors
    // See: https://www.npmjs.com/package/supports-color
    process.env.FORCE_COLOR = 1

    // Plugin API
    if (task.onBeforeRun) {
      await task.onBeforeRun({
        answers,
        args
      })
    }

    // Deduplicate arguments
    const dedupedArgs = []
    for (let i = args.length - 1; i >= 0; i--) {
      const arg = args[i]
      if (typeof arg === 'string' && arg.indexOf('--') === 0) {
        if (dedupedArgs.indexOf(arg) === -1) {
          dedupedArgs.push(arg)
        } else {
          const value = args[i + 1]
          if (value && value.indexOf('--') !== 0) {
            dedupedArgs.pop()
          }
        }
      } else {
        dedupedArgs.push(arg)
      }
    }
    args = dedupedArgs.reverse()

    if (command === 'npm') {
      args.splice(0, 0, '--')
    }

    log('Task run', command, args)

    updateOne({
      id: task.id,
      status: 'running'
    }, context)
    logs.add({
      message: `Task ${task.id} started`,
      type: 'info'
    }, context)

    addLog({
      taskId: task.id,
      type: 'stdout',
      text: chalk.grey(`$ ${command} ${args.join(' ')}`)
    }, context)

    task.time = Date.now()

    // Task env
    process.env.VUE_CLI_CONTEXT = cwd.get()
    process.env.VUE_CLI_PROJECT_ID = projects.getCurrent(context).id
    const nodeEnv = process.env.NODE_ENV
    delete process.env.NODE_ENV

    const child = execa(command, args, {
      cwd: cwd.get(),
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    })

    if (typeof nodeEnv !== 'undefined') {
      process.env.NODE_ENV = nodeEnv
    }

    task.child = child

    const outPipe = logPipe(queue => {
      addLog({
        taskId: task.id,
        type: 'stdout',
        text: queue
      }, context)
    })
    child.stdout.on('data', buffer => {
      outPipe.add(buffer.toString())
    })

    const errPipe = logPipe(queue => {
      addLog({
        taskId: task.id,
        type: 'stderr',
        text: queue
      }, context)
    })
    child.stderr.on('data', buffer => {
      errPipe.add(buffer.toString())
    })

    const onExit = async (code, signal) => {
      outPipe.flush()
      errPipe.flush()

      log('Task exit', command, args, 'code:', code, 'signal:', signal)

      const duration = Date.now() - task.time
      const seconds = Math.round(duration / 10) / 100
      addLog({
        taskId: task.id,
        type: 'stdout',
        text: chalk.grey(`Total task duration: ${seconds}s`)
      }, context)

      // Plugin API
      if (task.onExit) {
        await task.onExit({
          args,
          child,
          cwd: cwd.get(),
          code,
          signal
        })
      }

      if (code === null || task._terminating) {
        updateOne({
          id: task.id,
          status: 'terminated'
        }, context)
        logs.add({
          message: `Task ${task.id} was terminated`,
          type: 'info'
        }, context)
      } else if (code !== 0) {
        updateOne({
          id: task.id,
          status: 'error'
        }, context)
        logs.add({
          message: `Task ${task.id} ended with error code ${code}`,
          type: 'error'
        }, context)
        notify({
          title: `Task error`,
          message: `Task ${task.id} ended with error code ${code}`,
          icon: 'error'
        })
      } else {
        updateOne({
          id: task.id,
          status: 'done'
        }, context)
        logs.add({
          message: `Task ${task.id} completed`,
          type: 'done'
        }, context)
        notify({
          title: `Task completed`,
          message: `Task ${task.id} completed in ${seconds}s.`,
          icon: 'done'
        })
      }

      plugins.callHook({
        id: 'taskExit',
        args: [{
          task,
          args,
          child,
          cwd: cwd.get(),
          signal,
          code
        }],
        file: cwd.get()
      }, context)
    }

    child.on('exit', onExit)

    child.on('error', error => {
      const duration = Date.now() - task.time
      // hackish workaround for https://github.com/vuejs/vue-cli/issues/2096
      if (process.platform === 'win32' && error.code === 'ENOENT' && duration > WIN_ENOENT_THRESHOLD) {
        return onExit(null)
      }
      updateOne({
        id: task.id,
        status: 'error'
      }, context)
      logs.add({
        message: `Error while running task ${task.id} with message'${error.message}'`,
        type: 'error'
      }, context)
      notify({
        title: `Task error`,
        message: `Error while running task ${task.id} with message'${error.message}'`,
        icon: 'error'
      })
      addLog({
        taskId: task.id,
        type: 'stdout',
        text: chalk.red(`Error while running task ${task.id} with message '${error.message}'`)
      }, context)
      console.error(error)
    })

    // Plugin API
    if (task.onRun) {
      await task.onRun({
        args,
        child,
        cwd: cwd.get()
      })
    }

    plugins.callHook({
      id: 'taskRun',
      args: [{
        task,
        args,
        child,
        cwd: cwd.get()
      }],
      file: cwd.get()
    }, context)
  }
  return task
}

async function stop (id, context) {
  const task = findOne(id, context)
  if (task && task.status === 'running' && task.child) {
    task._terminating = true
    try {
      const { success, error } = await terminate(task.child, cwd.get())
      if (success) {
        updateOne({
          id: task.id,
          status: 'terminated'
        }, context)
      } else if (error) {
        throw error
      } else {
        throw new Error('Unknown error')
      }
    } catch (e) {
      console.log(chalk.red(`Can't terminate process ${task.child.pid}`))
      console.error(e)
    }
  }
  return task
}

function addLog (log, context) {
  const task = findOne(log.taskId, context)
  if (task) {
    if (task.logs.length === MAX_LOGS) {
      task.logs.shift()
    }
    task.logs.push(log)
    context.pubsub.publish(channels.TASK_LOG_ADDED, {
      taskLogAdded: log
    })
  }
}

function clearLogs (id, context) {
  const task = findOne(id, context)
  if (task) {
    task.logs = []
  }
  return task
}

function open (id, context) {
  const task = findOne(id, context)
  plugins.callHook({
    id: 'taskOpen',
    args: [{
      task,
      cwd: cwd.get()
    }],
    file: cwd.get()
  }, context)
  return true
}

function logPipe (action) {
  const maxTime = 300

  let queue = ''
  let size = 0
  let time = Date.now()
  let timeout

  const add = (string) => {
    queue += string
    size++

    if (size === 50 || Date.now() > time + maxTime) {
      flush()
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(flush, maxTime)
    }
  }

  const flush = () => {
    clearTimeout(timeout)
    if (!size) return
    action(queue)
    queue = ''
    size = 0
    time = Date.now()
  }

  return {
    add,
    flush
  }
}

function saveParameters ({ id }, context) {
  // Answers
  const answers = prompts.getAnswers()

  // Save parameters
  updateSavedData({
    id,
    answers
  }, context)

  return prompts.list()
}

async function restoreParameters ({ id }, context) {
  const task = findOne(id, context)
  if (task) {
    await prompts.reset()
    task.prompts.forEach(prompts.add)
    const data = getSavedData(id, context)
    if (data) {
      await prompts.setAnswers(data.answers)
    }
    await prompts.start()
  }

  return prompts.list()
}

module.exports = {
  list,
  findOne,
  getPrompts,
  run,
  stop,
  updateOne,
  clearLogs,
  open,
  saveParameters,
  restoreParameters
}
