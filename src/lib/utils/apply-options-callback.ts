/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type OptionsCallback<T> = ((this: T, arg1: T) => (T | void));

export default function applyOptionsCallback<T extends object>(optionsCallback: OptionsCallback<T>, options: T) {
    const result = optionsCallback.call(options, options);

    if (typeof result === 'object') {
        return result;
    }

    return options;
}
