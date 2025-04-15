/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { FriendlyError } from '../errors.ts';

const TYPE = 'missing-css-file';

function isMissingConfigError(e: FriendlyError) {
    if (e.name !== 'ModuleNotFoundError') {
        return false;
    }

    if (!e.message?.includes('Module not found: Error: Can\'t resolve')) {
        return false;
    }

    return true;
}

function getReference(error: FriendlyError & { message: string }) {
    const index = error.message.indexOf('Can\'t resolve \'') + 15;
    const endIndex = error.message.indexOf('\' in \'');

    return error.message.substring(index, endIndex);
}

export default function transform(error: FriendlyError) {
    if (!isMissingConfigError(error)) {
        return error;
    }

    error = Object.assign({}, error);

    error.type = TYPE;
    error.ref = getReference(error as FriendlyError & { message: string });
    error.severity = 900;

    return error;
}
