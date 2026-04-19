#!/usr/bin/env node
import { lint } from '../src/index.js'
import { Package } from '@vanillaes/esmtk'
import { Command } from 'commander'

const pkg = new Package()
const program = new Command()
  .name('lint-es')
  .version(pkg?.version || '', '-v, --version')
  .usage(`lint-es [...options] [files...]
    If [files...] is omitted, all JavaScript source files (**/*.js)
    in the current working directory are checked, recursively.

    Certain paths (node_modules/, coverage/, vendor/, *.min.js, hidden files)
    are automatically ignored.

    Paths in a project's .gitignore file are also automatically ignored.
  `)
  .description('Modern linting for ECMAScript Modules')
  .argument('[files]', 'File(s)/glob(s) to lint (default: **/*.js)')
  .option('--cwd [cwd]', 'Current working directory', process.cwd())
  .option('--fix', 'Automatically fix problems')
  .option('--ignore <ignore>', 'File(s)/glob(s) to ignore')
  .action((files, options) => {
    lint(files, options)
  })

program.parse(process.argv)
