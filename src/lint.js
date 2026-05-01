import { LintConfig } from './index.js'
import eslintConfig from './configs/eslint.config.js'
import { exists, matchAll, readGitIgnore } from '@vanillaes/esmtk'
import { resolve } from 'node:path'
import { ESLint } from 'eslint'

const DEFAULT_FILES = [
  '**/*.js'
]

const DEFAULT_IGNORE = [
  '**/*.min.js',
  'coverage/**',
  'node_modules/',
  'vendor/',
  '.*'
]

/**
 * Lint the following files
 * @param {string} [pattern] Pattern(s) used to locate the test files
 * @param {object} [options] 'lint' options
 * @param {string} [options.cwd] Current working directory
 * @param {boolean} [options.fix] Automatically fix problems
 * @param {string} [options.ignore] File(s)/glob(s) to ignore
 */
export async function lint (pattern, options = {}) {
  let {
    cwd = process.cwd(),
    fix,
    ignore
  } = options

  // current working directory
  cwd = `${resolve(cwd)}`
  const cwdExists = await exists(cwd)
  if (!cwdExists) {
    console.error(`lint-es: ${cwd} No such file or directory`)
    process.exitCode = 1
    return
  }

  let files, exclude
  ({ files, fix, exclude } = await consolidateConfig(pattern, fix, ignore, cwd))

  // Edge-Case: Exit early if no files are matched (ie to avoid ambiguous ESLing error)
  const fileList = await matchAll(files, cwd, exclude)
  if (fileList.length === 0) {
    console.log(`lint-es: No files matching '${files.join(',')}' were found`)
    process.exitCode = 0
    return
  }

  let results = []
  try {
    const eslint = new ESLint({
      cwd,
      ignorePatterns: exclude,
      overrideConfigFile: true,
      overrideConfig: eslintConfig,
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
 * Consiolidate the configurations (input, config, defaults)
 * @private
 * @param {string} [pattern] Pattern(s) used to locate the lint files
 * @param {boolean} [fix] Automatically fix problems
 * @param {string} [ignore] Pattern(s) used to ignore
 * @param {string} [cwd] Current working directory
 * @returns {Promise<{files: string[], fix: boolean, exclude: string[]}>} an object containing (files, exclude)
 */
async function consolidateConfig (pattern = '', fix, ignore = '', cwd = process.cwd()) {
  // extract config from package.json
  const config = new LintConfig(cwd)

  // consolidate file pattern(s)
  /** @type {string[]} */
  let files = []
  if (config.files) {
    files = config.files
  }
  if (pattern) {
    files = pattern.includes(',') ? pattern.split(',') : [pattern]
  }
  if (files.length === 0) {
    files = DEFAULT_FILES
  }
  files = [...new Set(files)]

  // consolidate --fix option
  if (!fix) {
    fix = config.fix || false
  }

  // consolidate ignore pattern(s)
  let exclude = [...DEFAULT_IGNORE]
  if (config.ignore) {
    exclude = config.ignore
  }
  if (ignore) {
    exclude = ignore.includes(',') ? ignore.split(',') : [ignore]
  }
  const gitIgnore = await readGitIgnore(cwd)
  exclude = [...exclude, ...DEFAULT_IGNORE, ...gitIgnore]
  exclude = [...new Set(exclude)]

  return { files, fix, exclude }
}
