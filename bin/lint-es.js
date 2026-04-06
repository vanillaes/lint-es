#!/usr/bin/env node
import { lint } from '../src/index.js'
import { createRequire } from 'node:module'
import { Command } from 'commander'
const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const program = new Command()
  .name('lint-es')
  .description('Modern linting for ECMAScript Modules')
  .version(pkg.version, '-v, --version')

program
  .description('Lint file(s) matching the provided pattern (default *.spec.js)')
  .usage(`lint-es [...options] [files...]
    If [files...] is omitted, all JavaScript source files (**/*.js)
    in the current working directory are checked, recursively.

    Certain paths (node_modules/, coverage/, vendor/, *.min.js, hidden files)
    are automatically ignored.

    Paths in a project's .gitignore file are also automatically ignored.
  `)
  .argument('[files]', 'file(s) to lint', '**/*.js')
  .option('--cwd [cwd]', 'current working directory', process.cwd())
  .option('--fix', 'automatically fix problems')
  .option('--ignore <ignore>', 'file(s) to ignore')
  .action((files, options) => {
    lint(files, options)
  })

program.parse(process.argv)
