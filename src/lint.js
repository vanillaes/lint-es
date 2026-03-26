import config from './configs/eslint.config.js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ESLint } from 'eslint'

/**
 * Lint the following files
 * @param {string} pattern the pattern(s) of files to include
 */
export async function lint (pattern) {
  const patterns = pattern.includes(',') ? pattern.split(',') : [pattern]
  let ignores = [] // TODO: replace [] with --ignore input

  // defaults
  const defaults = ['node_modules/', 'coverage/', 'vendor/', '**/*.min.js', '.*']
  // .gitignore
  const gitignores = await readGitIgnore(process.cwd()) // TODO: replace with `root`
  // combine
  ignores = [...defaults, ...gitignores]
  // de-duplicate
  ignores = [...new Set(ignores)]

  let results = []
  try {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: config,
      ignorePatterns: ignores
    })
    results = await eslint.lintFiles(patterns)
  } catch (err) {
    console.error('lint-es: Unexpected linter output')
    if (err instanceof Error) {
      console.error(err.stack || err.message)
    } else {
      console.error(err)
    }
    process.exitCode = 1
    return
  }

  const hasErrors = results.some(item => item.errorCount !== 0)
  const hasWarnings = results.some(item => item.warningCount !== 0)
  const hasFixable = results.some(item => item.messages.some(message => !!message.fix))

  if (!hasErrors && !hasWarnings) {
    process.exitCode = 0
    return
  }

  if (hasFixable) {
    console.error('lint-es: Run `lint-es --fix` to automatically fix some problems.')
  }

  for (const item of results) {
    for (const message of item.messages) {
      const path = item.filePath
      const line = message.line ? message.line : 0
      const col = message.column ? message.column : 0
      const msg = message.message
      const rule = message.ruleId
      const severity = message.severity === 1 ? ' (warning)' : ''
      console.log(`  ${path}:${line}:${col}: ${msg} (${rule})${severity}`)
    }
  }

  process.exitCode = hasErrors ? 1 : 0
}

/**
 * Read .gitignore
 * @param {string} root the root path
 * @returns {string[]} a comma-deliminated list of ignore globs
 */
async function readGitIgnore (root) {
  const path = join(root, '.gitignore')
  const contents = await readFile(path, 'utf8')
  return contents
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
}
