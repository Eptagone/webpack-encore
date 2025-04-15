/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface Options {
    /**
     * The directory to start searching from.
     */
    cwd?: string;
}

/**
 * Inlined version of the package "package-up" (ESM only).
 * @param options -
 * @returns The path to the nearest package.json file or undefined if not found.
 */
export default function (options: Required<Options>): string | undefined {
    return findUpSync('package.json', { cwd: options.cwd });
};

function toPath(urlOrPath: string | URL): string {
    return urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
}

/**
 * Inlined and simplified version of the package "find-up-simple" (ESM only).
 *
 * @param name - The name of the file to find
 * @param options -
 * @returns The path to the file found or undefined if not found.
 */
function findUpSync(name: string, options: Options = {}): string | undefined {
    options.cwd ??= process.cwd();
    let directory = path.resolve(toPath(options.cwd) || '');
    const { root } = path.parse(directory);

    while (directory && directory !== root) {
        const filePath = path.isAbsolute(name) ? name : path.join(directory, name);

        try {
            const stats = fs.statSync(filePath, { throwIfNoEntry: false });
            if (stats && stats.isFile()) {
                return filePath;
            }
        }
        catch (_) {
            // Do nothing
        }

        directory = path.dirname(directory);
    }

    return undefined;
}
