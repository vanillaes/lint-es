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

program.argument('[pattern]', '[...FILES]', '**/*.js')
  .description('Lint files matching the provided pattern (default *.spec.js)')
  .usage(`lint-es [...options] [FILES...]
    If FILES is omitted, all JavaScript source files (**/*.js)
    in the current working directory are checked, recursively.

    Certain paths (node_modules/, coverage/, vendor/, *.min.js, hidden files)
    are automatically ignored.

    Paths in a project's root .gitignore file are also automatically ignored.
  `)
  .action((pattern) => {
    lint(pattern)
  })

program.parse(process.argv)
