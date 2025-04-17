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

    messages.push(
        pc.red('Module build failed: Module not found:'),
    );
    for (const error of errors) {
        messages.push(`"${error.file}" contains a reference to the file "${error.ref}".`);
        messages.push('This file can not be found, please check it for typos or update it if the file got moved.');
        messages.push('');
    }

    return messages;
}

export default function format(errors: FriendlyError[]) {
    return formatErrors(errors.filter(e => (
        e.type === 'missing-css-file'
    )));
}
