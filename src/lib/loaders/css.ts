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
import type { CssLoaderOptions } from '../WebpackConfig.ts';

const require = createRequire(import.meta.url);

/**
 * @param webpackConfig -
 * @param useCssModules -
 * @returns Array of loaders to use for CSS files
 */
export function getLoaders(webpackConfig: WebpackConfig, useCssModules: boolean = false): WebpackLoader[] {
    const usePostCssLoader = webpackConfig.usePostCssLoader;

    let modulesConfig: CssLoaderOptions['modules'] = false;
    if (useCssModules) {
        modulesConfig = {
            localIdentName: '[local]_[hash:base64:5]',
        };
    }

    const options: CssLoaderOptions = {
        sourceMap: webpackConfig.useSourceMaps,
        // when using @import, how many loaders *before* css-loader should
        // be applied to those imports? This defaults to 0. When postcss-loader
        // is used, we set it to 1, so that postcss-loader is applied
        // to @import resources.
        importLoaders: usePostCssLoader ? 1 : 0,
        modules: modulesConfig,
    };

    const cssLoaders = [
        {
            loader: require.resolve('css-loader'),
            options: applyOptionsCallback(webpackConfig.cssLoaderConfigurationCallback, options),
        },
    ];

    if (usePostCssLoader) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('postcss');

        const postCssLoaderOptions = {
            sourceMap: webpackConfig.useSourceMaps,
        };

        cssLoaders.push({
            loader: require.resolve('postcss-loader'),
            options: applyOptionsCallback(webpackConfig.postCssLoaderOptionsCallback, postCssLoaderOptions),
        });
    }

    return cssLoaders;
}
