/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import webpack, { type WebpackPluginInstance } from 'webpack';
import type WebpackConfig from '../WebpackConfig.ts';
import PluginPriorities from './plugin-priorities.ts';

export default function (plugins: Array<{
    plugin: WebpackPluginInstance;
    priority: number;
}>, webpackConfig: WebpackConfig): void {
    if (Object.keys(webpackConfig.providedVariables).length > 0) {
        plugins.push({
            plugin: new webpack.ProvidePlugin(webpackConfig.providedVariables),
            priority: PluginPriorities.ProvidePlugin,
        });
    }
};
