/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import type { WebpackPluginInstance } from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import manifestPluginUtil from '../../src/lib/plugins/manifest.ts';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    const config = new WebpackConfig(runtimeConfig);
    config.setPublicPath('/foo');
    return config;
}

describe('plugins/manifest', () => {
    it('default settings', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(WebpackManifestPlugin);
        expect(plugins[0]!.plugin.options.fileName).to.equal('manifest.json');
    });

    it('with options callback', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(WebpackManifestPlugin);

        // Allows to override default options
        expect(plugins[0]!.plugin.options.fileName).to.equal('bar');
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: WebpackPluginInstance;
            priority: number;
        }> = [];

        config.configureManifestPlugin((options) => {
            options.fileName = 'bar';

            // This should override the original config
            return { foo: true };
        });

        manifestPluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(WebpackManifestPlugin);
        expect(plugins[0]!.plugin.options.fileName).to.equal('manifest.json');
        expect(plugins[0]!.plugin.options.foo).to.equal(true);
    });
});
