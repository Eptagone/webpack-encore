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
import webpack from 'webpack';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import definePluginUtil from '../../src/lib/plugins/define.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/define', () => {
    it('dev environment', () => {
        const config = createConfig('dev');
        const plugins: Array<{
            plugin: webpack.WebpackPluginInstance;
            priority: number;
        }> = [];

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        // @ts-expect-error It's okey. It's a test
        expect(plugins[0].plugin).to.be.instanceof(webpack.DefinePlugin);
        // @ts-expect-error It's okey. It's a test
        expect(plugins[0].plugin.definitions['process.env.NODE_ENV']).to.equal(JSON.stringify('development'));
    });

    it('production environment with default settings', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: webpack.WebpackPluginInstance;
            priority: number;
        }> = [];

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(webpack.DefinePlugin);
        expect(plugins[0]!.plugin.definitions['process.env.NODE_ENV']).to.equal(JSON.stringify('production'));
    });

    it('production environment with options callback', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: webpack.WebpackPluginInstance;
            priority: number;
        }> = [];

        config.configureDefinePlugin((options) => {
            options['foo'] = true;
            options['process.env.bar'] = true;
        });

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(webpack.DefinePlugin);

        // Allows to add new definitions
        expect(plugins[0]!.plugin.definitions.foo).to.equal(true);
        expect(plugins[0]!.plugin.definitions['process.env.bar']).to.equal(true);

        // Doesn't remove default definitions
        expect(plugins[0]!.plugin.definitions['process.env.NODE_ENV']).to.equal(JSON.stringify('production'));
    });

    it('production environment with options callback that returns an object', () => {
        const config = createConfig();
        const plugins: Array<{
            plugin: webpack.WebpackPluginInstance;
            priority: number;
        }> = [];

        config.configureDefinePlugin((options) => {
            options['bar'] = true;

            // This should override the original config
            return { foo: true };
        });

        definePluginUtil(plugins, config);
        expect(plugins.length).to.equal(1);
        expect(plugins[0]!.plugin).to.be.instanceof(webpack.DefinePlugin);
        expect(plugins[0]!.plugin.definitions.bar).to.be.undefined;
        expect(plugins[0]!.plugin.definitions.foo).to.equal(true);
    });
});
