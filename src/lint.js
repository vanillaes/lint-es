import { LintConfig } from './index.js'
import eslintConfig from './configs/eslint.config.js'
import { exists, match, readGitIgnore } from '@vanillaes/esmtk'
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
 * @param {string} files File(s)/glob(s) to lint
 * @param {object} [options] 'lint' options
 * @param {string} [options.cwd] Current working directory
 * @param {boolean} [options.fix] Automatically fix problems
 * @param {string} [options.ignore] File(s)/glob(s) to ignore
 */
export async function lint (files, options = {}) {
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

  // extract config from package.json
  const config = new LintConfig(cwd)

  // [files] argument
  /** @type {string[]} */
  let filesArr = []
  if (config.files) {
    filesArr = config.files
  }
  if (files) {
    filesArr = files.includes(',') ? files.split(',') : [files]
  }
  filesArr = [...filesArr, ...DEFAULT_FILES]
  filesArr = [...new Set(filesArr)]

  // --fix option
  fix = fix || config.fix || false

  // --ignore option
  /** @type {string[]} */
  let ignoreArr = []
  if (config.ignore) {
    ignoreArr = config.ignore
  }
  if (ignore) {
    ignoreArr = ignore.includes(',') ? ignore.split(',') : [ignore]
  }
  const gitIgnore = await readGitIgnore(cwd)
  ignoreArr = [...ignoreArr, ...DEFAULT_IGNORE, ...gitIgnore]
  ignoreArr = [...new Set(ignoreArr)]

  // Edge-Case: Exit early if no files are matched (ie to avoid ambiguous ESLing error)
  const fileList = await match(filesArr.join(','), cwd, ignoreArr.join(','))
  if (fileList.length === 0) {
    console.log(`lint-es: No files matching '${filesArr.join(',')}' were found`)
    process.exitCode = 0
    return
  }

  let results = []
  try {
    const eslint = new ESLint({
      cwd,
      ignorePatterns: ignoreArr,
      overrideConfigFile: true,
      overrideConfig: eslintConfig,
      fix
    })
    results = await eslint.lintFiles(filesArr)

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
