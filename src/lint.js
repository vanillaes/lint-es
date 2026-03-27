import config from './configs/eslint.config.js'
import { access, constants, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { ESLint } from 'eslint'

/**
 * Lint the following files
 * @param {string} file the pattern(s) of file(s) to include
 * @param {string | boolean | string[] | undefined} options lint options
 */
export async function lint (file, options) {
  const fix = options?.fix ? options.fix : false

  const cwd = `${resolve(options?.cwd)}`
  const exists = await fileExists(cwd)
  if (!exists) {
    console.error(`lint-es: ${cwd} No such file or directory`)
    process.exitCode = 1
    return
  }

  // [file] argument
  let files = []
  if (file) {
    files = file.includes(',') ? file.split(',') : [file]
  }

  // --ignore option
  let ignores = []
  if (options?.ignore) {
    ignores = options.ignore.includes(',') ? options.ignore.split(',') : [options.ignore]
  }
  // defaults
  const defaults = ['node_modules/', 'coverage/', 'vendor/', '**/*.min.js', '.*']
  // .gitignore
  const gitignores = await readGitIgnore(cwd)
  // combine
  ignores = [...ignores, ...defaults, ...gitignores]
  // de-duplicate
  ignores = [...new Set(ignores)]

  let results = []
  try {
    const eslint = new ESLint({
      cwd,
      ignorePatterns: ignores,
      overrideConfigFile: true,
      overrideConfig: config,
      fix
    })
    results = await eslint.lintFiles(files)

    if (fix) {
      await ESLint.outputFixes(results)
    }
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
 * @param {string} cwd the current working directory
 * @returns {string[]} a comma-deliminated list of ignore globs
 */
async function readGitIgnore (cwd) {
  const path = join(cwd, '.gitignore')
  const exists = await fileExists(path)
  if (!exists) {
    return []
  }
  const contents = await readFile(path, 'utf8')
  return contents
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
}

/**
 * Check if a file/folder exists
 * @param {string} path the path to the file/folder
 * @returns {Promise<boolean>} true if the file/folder exists, false otherwise
 */
export async function fileExists (path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}
