/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { createRequire } from 'module';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.ts';

const require = createRequire(import.meta.url);

/**
 * Prepends loaders with MiniCssExtractPlugin.loader
 * @param webpackConfig -
 * @param loaders - An array of some style loaders
 * @returns
 */
export function prependLoaders(webpackConfig: WebpackConfig, loaders: WebpackLoader[]) {
    if (!webpackConfig.extractCss) {
        const options = {};

        // If the CSS extraction is disabled, use the
        // style-loader instead.
        return [{
            loader: require.resolve('style-loader'),
            options: applyOptionsCallback(webpackConfig.styleLoaderConfigurationCallback, options),

        }, ...loaders];
    }

    return [{
        loader: MiniCssExtractPlugin.loader,
        options: applyOptionsCallback(
            webpackConfig.miniCssExtractLoaderConfigurationCallback,
            {},
        ),
    }, ...loaders];
}
