/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

interface FriendlyErrorBaseStructure<T = boolean> {
    type?: string;
    file: string;
    loaderName?: string;
    name?: string;
    severity?: number;
    isVueLoader?: T;
    ref?: string;
}

type FriendlyErrorBase<T = boolean> = FriendlyErrorBaseStructure<T> & (
    T extends true ? { message: string; origin: string } : { message?: string; origin?: never }
);

export type FriendlyError = FriendlyErrorBase<true> | FriendlyErrorBase<false>;
