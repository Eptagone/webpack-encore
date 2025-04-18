/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pc from 'picocolors';
import type { FriendlyError } from '../errors.ts';

function formatErrors(errors: FriendlyError[]) {
    if (errors.length === 0) {
        return [];
    }

    const messages: string[] = [];
    // there will be an error for *every* file, but showing
    // the error over and over again is not helpful

    messages.push(
        pc.red('Module build failed: Error: No PostCSS Config found'),
    );
    messages.push('');
    messages.push(`${pc.bgGreen(pc.black('FIX'))} Create a ${pc.yellow('postcss.config.js')} file at the root of your project.`);
    messages.push('');
    messages.push('Here is an example to get you started!');
    messages.push(pc.yellow(`
// postcss.config.js
module.exports = {
  plugins: {
    'autoprefixer': {},
  }
}
    `));

    messages.push('');
    messages.push('');

    return messages;
}

export default function format(errors: FriendlyError[]) {
    return formatErrors(errors.filter(e => (
        e.type === 'missing-postcss-config'
    )));
}
