/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import PrettyError from 'pretty-error';

interface Options {
    /**
     * An optional callback that defines whether or not each line of the eventual stacktrace should be kept.
     * @param line - Content of the line
     * @param lineNumber - Line number
     * @returns
     */
    skipTrace?: (line: string, lineNumber: number) => boolean;
}

/**
 * Render a pretty version of the given error.
 * @param error -
 * @param options -
 */
export default function (error: Error, options: Options = {}): void {
    const pe = new PrettyError();

    // Use the default terminal's color
    // for the error message.
    pe.appendStyle({
        'pretty-error > header > message': { color: 'none' },
    });

    // Allow to skip some parts of the
    // stacktrace if there is one.
    if (options.skipTrace) {
        pe.skip(options.skipTrace);
    }

    console.log(pe.render(error));
};
