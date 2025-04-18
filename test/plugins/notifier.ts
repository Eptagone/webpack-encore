/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import type { WebpackPluginInstance } from 'webpack';
import WebpackNotifier from 'webpack-notifier';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import notifierPluginUtil from '../../src/lib/plugins/notifier.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/notifier', () => {
    it('disabled by default', () => {
        const config = createConfig();
        const plugins: Array<{ plugin: WebpackPluginInstance; priority: number }> = [];

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('explicitly disabled', () => {
        const config = createConfig();
        const plugins: Array<{ plugin: WebpackPluginInstance; priority: number }> = [];

        config.enableBuildNotifications(false);

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(0);
    });

    it('enabled with default settings', () => {
        const config = createConfig();
        const plugins: Array<{ plugin: WebpackPluginInstance; priority: number }> = [];

        config.enableBuildNotifications();

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0]!.plugin.options.title).to.equal('Webpack Encore');
    });

    it('enabled with options callback', () => {
        const config = createConfig();
        const plugins: Array<{ plugin: WebpackPluginInstance; priority: number }> = [];

        config.enableBuildNotifications(true, (options) => {
            options.title = 'foo';
        });

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0]!.plugin.options.title).to.equal('foo');
    });

    it('enabled with options callback that returns an object', () => {
        const config = createConfig();
        const plugins: Array<{ plugin: WebpackPluginInstance; priority: number }> = [];

        config.enableBuildNotifications(true, (options) => {
            options.title = 'foo';

            // This should override the original config
            return { foo: true };
        });

        notifierPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(WebpackNotifier);
        expect(plugins[0]!.plugin.options.title).to.be.undefined;
        expect(plugins[0]!.plugin.options.foo).to.equal(true);
    });
});
