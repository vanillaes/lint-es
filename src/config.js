import { Package } from '@vanillaes/esmtk'

/** @typedef {import('@vanillaes/esmtk').RawPackage} RawPackage */

/**
 * @typedef {object} RawLintConfig
 * @property {object|undefined} [lint] Lint config
 * @property {string|string[]} [lint.files] Lint files config option
 * @property {boolean} [lint.fix] Lint fix config option
 * @property {string|string[]} [lint.ignore] Lint ignore config option
 */

/**
 * @typedef {RawPackage & RawLintConfig} RawLintPackage
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
