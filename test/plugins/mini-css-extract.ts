/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import type { WebpackPluginInstance } from 'webpack';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import miniCssExtractPluginUtil from '../../src/lib/plugins/mini-css-extract.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/mini-css-extract', () => {
    it('with default settings and versioning disabled', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0]!.plugin.options.filename).to.equal('[name].css');
    });

    it('with default settings and versioning enabled', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        config.enableVersioning();

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0]!.plugin.options.filename).to.equal('[name].[contenthash:8].css');
    });

    it('with CSS extraction disabled', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        config.disableCssExtraction();

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        config.configureMiniCssExtractPlugin(
            () => { },
            (options) => {
                options.filename = '[name].css';
            },
        );

        miniCssExtractPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(MiniCssExtractPlugin);
        expect(plugins[0]!.plugin.options.filename).to.equal('[name].css');
    });
});
