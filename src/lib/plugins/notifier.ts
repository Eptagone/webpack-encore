/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createRequire } from 'module';
import type { WebpackPluginInstance } from 'webpack';
import type WebpackNotifierPlugin from 'webpack-notifier';
import * as pluginFeatures from '../features.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.ts';
import PluginPriorities from './plugin-priorities.ts';

const require = createRequire(import.meta.url);

export default function (plugins: Array<{
    plugin: WebpackPluginInstance;
    priority: number;
}>, webpackConfig: WebpackConfig): void {
    if (!webpackConfig.useWebpackNotifier) {
        return;
    }

    pluginFeatures.ensurePackagesExistAndAreCorrectVersion('notifier');

    const notifierPluginOptions = {
        title: 'Webpack Encore',
    };

    const WebpackNotifier: typeof WebpackNotifierPlugin = require('webpack-notifier');
    plugins.push({
        plugin: new WebpackNotifier(
            applyOptionsCallback(webpackConfig.notifierPluginOptionsCallback, notifierPluginOptions),
        ),
        priority: PluginPriorities.WebpackNotifier,
    });
};
