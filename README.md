<h1 align="center">Lint-ES</h1>

<div align="center">🧹  Modern linting for ECMAScript Modules based on <a href="https://standardjs.com/">StandardJS</a>  🧹</div>

<br />

<div align="center">
  <a href="https://github.com/vanillaes/lint-es/releases"><img src="https://badgen.net/github/tag/vanillaes/lint-es?cache-control=no-cache" alt="GitHub Release"></a>
  <a href="https://www.npmjs.com/package/@vanillaes/lint-es"><img src="https://badgen.net/npm/v/@vanillaes/lint-es?icon=npm" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/@vanillaes/lint-es"><img src="https://badgen.net/npm/dm/@vanillaes/lint-es?icon=npm" alt="NPM Downloads"></a>
  <a href="https://github.com/vanillaes/lint-es/actions"><img src="https://github.com/vanillaes/lint-es/workflows/Latest/badge.svg" alt="Latest Status"></a>
  <a href="https://github.com/vanillaes/lint-es/actions"><img src="https://github.com/vanillaes/lint-es/workflows/Release/badge.svg" alt="Release Status"></a>
</div>

## Features

- **No Configuration**. No `.eslint*` files to manage.
- Pre-loaded with the **[NeoStandard][]** ruleset for clean JavaScript code and styling.
- Configured with the **[eslint-plugin-jsdoc][]** ruleset for linting JSDoc comments.
- The following are ignored by default: `node_modules/`, `coverage/`, `vendor/`, `*.min.js`, and hidden files.
- Files included in `.gitignore` will be ignored as well.
- Automatically correct linting issues using `lint-es --fix`.


*Note: **[NeoStandard][]** is a ESLint v9.x+ ruleset. Successor to **[StandardJS][]**.*

## lint-es

### Arguments

`lint-es [...options] [files...]`

- `[files]` - File(s)/glob(s) to lint (default `**/*.js`)
- `--cwd` - Current working directory
- `--fix` - Automatically fix problems
- `--ignore` - File(s)/glob(s) to ignore

### Usage

```sh
# lint the source
lint-es

```sh
# lint the source (matching a different file(s))
lint-es '**/*.mjs'

# lint the source (change the root)
lint-es --cwd src/

# lint the source (automatically fix issues)
lint-es --fix

# lint the source (ignore files)
lint-es --ignore test1/,test2/**/*
```

*Note: In Linux/OSX, matcher patterns must be delimited in quotes.*

## Configuration

Project-level config can be defined in `package.json`

*package.json*
```json
{
  "lint" {
    "files": [ "**.*.mjs" ],
    "fix": true,
    "ignore": [ "test/**.*" ]
  }
}
```

**Note: Configuration defined in the command-line will take precedence over `package.json` configuration.**


[StandardJS]: https://standardjs.com/
[NeoStandard]: https://github.com/neostandard/neostandard
[eslint-plugin-jsdoc]: https://github.com/gajus/eslint-plugin-jsdoc
