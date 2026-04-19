import { Package } from '@vanillaes/esmtk'

/**
 * @typedef {object} RawLintPackage
 * @property {string|undefined} [name] Name
 * @property {string|undefined} [version] Version
 * @property {string|undefined} [description] Description
 * @property {string[]|undefined} [keywords] Keywords
 * @property {string|undefined} [repository] Repository
 * @property {string|undefined} [author] Author
 * @property {string|undefined} [license] License
 * @property {string|undefined} [type] Type
 * @property {{[key: string]: {[key: string]: string}}|undefined} [bin] Binaries
 * @property {{[key: string]: {[key: string]: string}}|undefined} [exports] Exports
 * @property {{[key: string]: {[key: string]: string}}|undefined} [scripts] Scripts
 * @property {object|undefined} [engines] Engines
 * @property {object|undefined} [dependencies] Dependencies
 * @property {object|undefined} [devDependencies] DevDependencies
 * @property {RawLintConfig} [lint] Lint Config
 * @property {string|string[]} [lint.files] Lint files Config option
 * @property {boolean} [lint.fix] Lint fix config option
 * @property {string|string[]} [lint.ignore] Lint ignore config option
 */

/**
 * @typedef {object} RawLintConfig
 * @property {string|string[]} [files] Lint files Config option
 * @property {boolean} [fix] Lint fix config option
 * @property {string|string[]} [ignore] Lint ignore config option
 */

/**
 * package.json - Lint Config
 * @augments Package
 */
export class LintConfig extends Package {
  /** @type {RawLintConfig} */
  #config = {}

  /**
   * @param {string} [cwd] Current working directory
   */
  constructor (cwd) {
    super(cwd)

    /** @type {RawLintPackage} */
    const contents = this.contents
    this.#config = contents.lint || {}

    // fix the prototype
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Lint Config
   * @type {RawLintConfig}
   */
  get config () {
    return this.#config
  }

  /**
   * Lint files config option
   * @type {string[]|undefined}
   */
  get files () {
    if (Array.isArray(this.#config.files)) {
      /** @type {string[]} */ return this.#config.files
    }
    if (typeof this.#config.files === 'string') {
      return [this.#config.files]
    }
    return undefined
  }

  /**
   * Lint fix config option
   * @type {boolean|undefined}
   */
  get fix () {
    return !!this.#config.fix
  }

  /**
   * Lint ignore config option
   * @type {string[]|undefined}
   */
  get ignore () {
    if (Array.isArray(this.#config.ignore)) {
      /** @type {string[]} */ return this.#config.ignore
    }
    if (typeof this.#config.ignore === 'string') {
      return [this.#config.ignore]
    }
    return undefined
  }
}
