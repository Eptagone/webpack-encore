/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { WebpackPluginInstance } from 'webpack';
import copyEntryTmpName from '../utils/copyEntryTmpName.ts';
import DeleteUnusedEntriesJSPlugin from '../webpack/delete-unused-entries-js-plugin.ts';
import type WebpackConfig from '../WebpackConfig.ts';
import PluginPriorities from './plugin-priorities.ts';

export default function (plugins: Array<{
    plugin: WebpackPluginInstance;
    priority: number;
}>, webpackConfig: WebpackConfig): void {
    const entries = [...webpackConfig.styleEntries.keys()];

    if (webpackConfig.copyFilesConfigs.length > 0) {
        entries.push(copyEntryTmpName);
    }

    plugins.push({
        plugin: new DeleteUnusedEntriesJSPlugin(entries),
        priority: PluginPriorities.DeleteUnusedEntriesJSPlugin,
    });
};
