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

const require = createRequire(import.meta.url);

/**
 * @param webpackConfig -
 * @returns of loaders to use for Handlebars
 */
export function getLoaders(webpackConfig: WebpackConfig): WebpackLoader[] {
    loaderFeatures.ensurePackagesExistAndAreCorrectVersion('handlebars');

    const options = {};

    return [
        {
            loader: require.resolve('handlebars-loader'),
            options: applyOptionsCallback(webpackConfig.handlebarsConfigurationCallback, options),
        },
    ];
};
