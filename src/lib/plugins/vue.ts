/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createRequire } from 'module';
import type { VueLoaderPlugin } from 'vue-loader';
import type { WebpackPluginInstance } from 'webpack';
import type WebpackConfig from '../WebpackConfig.ts';
import PluginPriorities from './plugin-priorities.ts';

const require = createRequire(import.meta.url);

export default function (plugins: Array<{
    plugin: WebpackPluginInstance;
    priority: number;
}>, webpackConfig: WebpackConfig): void {
    if (!webpackConfig.useVueLoader) {
        return;
    }

    const vueLoader: { VueLoaderPlugin: typeof VueLoaderPlugin } = require('vue-loader');

    plugins.push({
        plugin: new vueLoader.VueLoaderPlugin(),
        priority: PluginPriorities.VueLoaderPlugin,
    });
};
