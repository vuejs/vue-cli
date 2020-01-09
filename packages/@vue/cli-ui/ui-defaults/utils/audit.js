const { hasProjectYarn, hasProjectPnpm, execa } = require('@vue/cli-shared-utils')

const severity = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3
}

exports.auditProject = async function (cwd) {
  try {
    if (hasProjectYarn(cwd)) {
      const child = await execa('yarn', [
        'audit',
        '--json',
        '--non-interactive',
        '--no-progress'
      ], {
        cwd,
        reject: false
      })

      if (child.stderr) {
        const errLines = child.stderr.split('\n').map(l => l.trim()).filter(l => l)
        const error = errLines.find(l => l.startsWith('Error:'))
        if (error) {
          throw new Error(error.substr('Error:'.length).trim())
        }
      }

      const data = child.stdout

      let auditAdvisories = []

      const ids = {}

      const lines = data.split(`\n`).filter(l => l.trim()).map(l => JSON.parse(l))
      for (const line of lines) {
        if (line.type === 'auditAdvisory') {
          if (!ids[line.data.advisory.id]) {
            auditAdvisories.push(line)
            ids[line.data.advisory.id] = true
          }
        }
      }

      const details = {
        vulnerabilities: [],
        summary: {
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0
        }
      }

      auditAdvisories.sort((a, b) => severity[a.data.advisory.severity] - severity[b.data.advisory.severity])

      let id = 0
      for (const { data: { advisory } } of auditAdvisories) {
        for (const finding of advisory.findings) {
          // const [finding] = advisory.findings
          const detail = {
            id: id++,
            name: advisory.module_name,
            version: finding.version,
            parents: finding.paths.sort(
              (a, b) => a.length - b.length
            ).map(
              parents => parents.split('>').slice(0, parents.length - 2).map(p => ({
                name: p
              }))
            ),
            moreInfo: advisory.url,
            severity: advisory.severity,
            title: advisory.title,
            message: advisory.overview,
            versions: {
              vulnerable: advisory.vulnerable_versions,
              patched: advisory.patched_versions
            },
            recommendation: advisory.recommendation
          }
          details.vulnerabilities.push(detail)
          details.summary[advisory.severity]++
        }
      }

      const status = {
        status: 'ok',
        count: details.vulnerabilities.length,
        message: null
      }

      if (status.count) {
        status.status = 'attention'
      }

      for (const n in details.summary) {
        if (details.summary) {
          status.severity = n
          break
        }
      }

      return {
        status,
        details
      }
    } else if (hasProjectPnpm(cwd)) {
      // TODO pnpm audit
      return {
        status: {
          status: 'error',
          message: 'Not implemented for PNPM projects yet'
        },
        details: null
      }
    } else {
      // TODO NPM audit
      return {
        status: {
          status: 'error',
          message: 'Not implemented for NPM projects yet'
        },
        details: null
      }
    }
  } catch (e) {
    return {
      status: {
        status: 'error',
        message: e.message
      },
      details: null
    }
  }
}
