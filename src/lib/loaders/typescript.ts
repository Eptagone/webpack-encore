/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createRequire } from 'module';
import type WebpackConfig from '../WebpackConfig.ts';
import * as loaderFeatures from '../features.ts';
import type ForkedTypesPlugin from '../plugins/forked-ts-types.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import * as babelLoader from './babel.ts';

const require = createRequire(import.meta.url);

/**
 * @param webpackConfig -
 * @returns Array of loaders to use for TypeScript
 */
export function getLoaders(webpackConfig: WebpackConfig): WebpackLoader[] {
    loaderFeatures.ensurePackagesExistAndAreCorrectVersion('typescript');

    // some defaults
    let config: Record<string, unknown> = {
        silent: true,
    };

    // allow for ts-loader config to be controlled
    config = applyOptionsCallback(webpackConfig.tsConfigurationCallback, config);

    // fork-ts-checker-webpack-plugin integration
    if (webpackConfig.useForkedTypeScriptTypeChecking) {
        loaderFeatures.ensurePackagesExistAndAreCorrectVersion('forkedtypecheck');
        // force transpileOnly to speed up
        config.transpileOnly = true;

        // add forked ts types plugin to the stack

        const forkedTypesPluginUtil: { default: typeof ForkedTypesPlugin } = require('../plugins/forked-ts-types.ts');
        forkedTypesPluginUtil.default(webpackConfig);
    }

    // allow to import .vue files
    if (webpackConfig.useVueLoader) {
        config.appendTsSuffixTo = [/\.vue$/];
    }

    // use ts alongside with babel
    // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#babel
    const loaders = babelLoader.getLoaders(webpackConfig);
    return loaders.concat([
        {
            loader: require.resolve('ts-loader'),
            // @see https://github.com/TypeStrong/ts-loader/blob/master/README.md#available-options
            options: config,
        },
    ]);
}
