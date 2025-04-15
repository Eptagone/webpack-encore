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
import type WebpackConfig from '../WebpackConfig.ts';
import * as cssLoader from './css.ts';

const require = createRequire(import.meta.url);

/**
 * @param webpackConfig -
 * @param useCssModules -
 * @returns Array of loaders to use for Less files
 */
export function getLoaders(webpackConfig: WebpackConfig, useCssModules: boolean = false): WebpackLoader[] {
    loaderFeatures.ensurePackagesExistAndAreCorrectVersion('less');

    const config = {
        sourceMap: webpackConfig.useSourceMaps,
    };

    return [
        ...cssLoader.getLoaders(webpackConfig, useCssModules),
        {
            loader: require.resolve('less-loader'),
            options: applyOptionsCallback(webpackConfig.lessLoaderOptionsCallback, config),
        },
    ];
}
