/**
 * Lint the following files
 * @param {string} file the pattern(s) of file(s) to include
 * @param {object} options lint options
 */
export function lint(file: string, options: object): Promise<void>;
/**
 * Check if a file/folder exists
 * @param {string} path the path to the file/folder
 * @returns {Promise<boolean>} true if the file/folder exists, false otherwise
 */
export function fileExists(path: string): Promise<boolean>;
