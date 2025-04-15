/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import type { WebpackPluginInstance } from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import copyEntryTmpName from '../utils/copyEntryTmpName.ts';
import manifestKeyPrefixHelper from '../utils/manifest-key-prefix-helper.ts';
import type WebpackConfig from '../WebpackConfig.ts';
import PluginPriorities from './plugin-priorities.ts';

export default function (plugins: Array<{
    plugin: WebpackPluginInstance;
    priority: number;
}>, webpackConfig: WebpackConfig): void {
    let manifestPluginOptions: WebpackManifestPlugin['options'] = {
        seed: {},
        basePath: manifestKeyPrefixHelper(webpackConfig),
        // always write a manifest.json file, even with webpack-dev-server
        writeToFileEmit: true,
        filter: (file: any) => {
            const isCopyEntry = file.isChunk && copyEntryTmpName === file.chunk.id;
            const isStyleEntry = file.isChunk && webpackConfig.styleEntries.has(file.chunk.name);
            const isJsOrJsMapFile = /\.js(\.map)?$/.test(file.name);

            return !isCopyEntry && !(isStyleEntry && isJsOrJsMapFile);
        },
    };

    manifestPluginOptions = applyOptionsCallback(
        webpackConfig.manifestPluginOptionsCallback,
        manifestPluginOptions,
    );

    const userMapOption = manifestPluginOptions.map;
    manifestPluginOptions.map = (file: any) => {
        const newFile = Object.assign({}, file, {
            name: file.name.replace('?copy-files-loader', ''),
        });

        if (typeof userMapOption === 'function') {
            return userMapOption(newFile);
        }

        return newFile;
    };

    plugins.push({
        plugin: new WebpackManifestPlugin(manifestPluginOptions),
        priority: PluginPriorities.WebpackManifestPlugin,
    });
};
