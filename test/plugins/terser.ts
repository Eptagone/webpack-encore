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
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import terserPluginUtil from '../../src/lib/plugins/terser.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig(environment = 'production') {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;
    runtimeConfig.environment = environment;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/terser', () => {
    it('production environment default settings', () => {
        const config = createConfig();

        const plugin = terserPluginUtil(config);
        expect(plugin).to.be.instanceof(TerserPlugin);
        // @ts-expect-error It's okey. It's a test
        expect(plugin.options.parallel).to.equal(true);
    });

    it('with options callback', () => {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.test = 'custom_test';
        });

        const plugin = terserPluginUtil(config);

        // Allows to override default options
        // @ts-expect-error It's okey. It's a test
        expect(plugin.options.test).to.equal('custom_test');

        // Doesn't remove default options
        // @ts-expect-error It's okey. It's a test
        expect(plugin.options.parallel).to.equal(true);
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();

        config.configureTerserPlugin((options) => {
            options.test = 'custom_test';

            // This should override the original config
            return { parallel: false };
        });

        const plugin = terserPluginUtil(config);
        // @ts-expect-error It's okey. It's a test
        expect(plugin.options.test).to.not.equal('custom_test');
        // @ts-expect-error It's okey. It's a test
        expect(plugin.options.parallel).to.equal(false);
    });
});
