/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createRequire } from 'module';
import * as loaderFeatures from '../features.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import getVueVersion from '../utils/get-vue-version.ts';
import type WebpackConfig from '../WebpackConfig.ts';

const require = createRequire(import.meta.url);

/**
 * @param webpackConfig -
 * @returns of loaders to use for Vue files
 */
export function getLoaders(webpackConfig: WebpackConfig): WebpackLoader[] {
    const vueVersion = getVueVersion(webpackConfig);
    loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue' + vueVersion);

    const options = {};

    return [
        {
            loader: require.resolve('vue-loader'),
            options: applyOptionsCallback(webpackConfig.vueLoaderOptionsCallback, options),
        },
    ];
}
