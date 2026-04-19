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
    /**
     * Lint Config
     * @type {RawLintConfig}
     */
    get config(): RawLintConfig;
    /**
     * Lint files config option
     * @type {string[]|undefined}
     */
    get files(): string[] | undefined;
    /**
     * Lint fix config option
     * @type {boolean|undefined}
     */
    get fix(): boolean | undefined;
    /**
     * Lint ignore config option
     * @type {string[]|undefined}
     */
    get ignore(): string[] | undefined;
    #private;
}
export type RawLintPackage = {
    /**
     * Name
     */
    name?: string | undefined;
    /**
     * Version
     */
    version?: string | undefined;
    /**
     * Description
     */
    description?: string | undefined;
    /**
     * Keywords
     */
    keywords?: string[] | undefined;
    /**
     * Repository
     */
    repository?: string | undefined;
    /**
     * Author
     */
    author?: string | undefined;
    /**
     * License
     */
    license?: string | undefined;
    /**
     * Type
     */
    type?: string | undefined;
    /**
     * Binaries
     */
    bin?: {
        [key: string]: {
            [key: string]: string;
        };
    } | undefined;
    /**
     * Exports
     */
    exports?: {
        [key: string]: {
            [key: string]: string;
        };
    } | undefined;
    /**
     * Scripts
     */
    scripts?: {
        [key: string]: {
            [key: string]: string;
        };
    } | undefined;
    /**
     * Engines
     */
    engines?: object | undefined;
    /**
     * Dependencies
     */
    dependencies?: object | undefined;
    /**
     * DevDependencies
     */
    devDependencies?: object | undefined;
    /**
     * Lint Config
     */
    lint?: RawLintConfig | undefined;
    /**
     * Lint files Config option
     */
    files?: string | string[] | undefined;
    /**
     * Lint fix config option
     */
    fix?: boolean | undefined;
    /**
     * Lint ignore config option
     */
    ignore?: string | string[] | undefined;
};
export type RawLintConfig = {
    /**
     * Lint files Config option
     */
    files?: string | string[] | undefined;
    /**
     * Lint fix config option
     */
    fix?: boolean | undefined;
    /**
     * Lint ignore config option
     */
    ignore?: string | string[] | undefined;
};
import { Package } from '@vanillaes/esmtk';
