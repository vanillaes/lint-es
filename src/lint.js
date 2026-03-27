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
  const cwd = `${resolve(options?.cwd)}`
  const exists = await fileExists(cwd)
  if (!exists) {
    console.error(`lint-es: ${cwd} No such file or directory`)
    process.exitCode = 1
    return
  }

  // check package.json config
  let { files, fix, ignores } = await applyPackageJSON(cwd, { files: [], fix: false, ignores: [] })

  // [file] argument
  if (file) {
    files = file.includes(',') ? file.split(',') : [file]
  }

  // --ignore option
  if (options?.ignore) {
    ignores = options.ignore.includes(',') ? options.ignore.split(',') : [options.ignore]
  }
  const defaultIgnores = ['node_modules/', 'coverage/', 'vendor/', '**/*.min.js', '.*']
  const gitIgnores = await readGitIgnore(cwd)
  ignores = [...ignores, ...defaultIgnores, ...gitIgnores]
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
 * Read Config from package.json
 * @param {string} cwd the current working directory
 * @param {dict} options a dict of config options
 * @returns {dict} a dict of config options
 */
async function applyPackageJSON (cwd, options = {}) {
  const path = join(cwd, 'package.json')
  const exists = await fileExists(path)
  if (!exists) {
    return options
  }

  const contents = await readFile(path, 'utf8')
  const pkg = JSON.parse(contents)

  if (!Object.hasOwn(pkg, 'lint')) {
    return options
  }

  if (pkg?.lint?.files) {
    if (!Array.isArray(pkg.lint.files) && typeof pkg.lint.files !== 'string') {
      return options
    }

    if (Array.isArray(pkg.lint.files)) {
      options.files = pkg.lint.files
    }

    if (typeof pkg.lint.files === 'string') {
      options.files = [pkg.lint.files]
    }
  }

  if (pkg?.lint?.fix) {
    if (typeof pkg.lint.fix !== 'boolean') {
      return options
    }
    options.fix = pkg.lint.fix
  }

  if (pkg?.lint?.ignore) {
    if (!Array.isArray(pkg.lint.ignore)) {
      return options
    }
    options.ignores = pkg.lint.ignore
  }

  return options
}
