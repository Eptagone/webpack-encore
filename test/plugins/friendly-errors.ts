/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import FriendlyErrorsWebpackPlugin from '@nuxt/friendly-errors-webpack-plugin';
import { expect } from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import friendlyErrorsPluginUtil from '../../src/lib/plugins/friendly-errors.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/friendly-errors', () => {
    it('with default settings', () => {
        const config = createConfig();

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).to.be.instanceof(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).to.equal(false);
        expect(plugin.formatters.length).to.equal(6);
        expect(plugin.transformers.length).to.equal(6);
    });

    it('with options callback', () => {
        const config = createConfig();

        config.configureFriendlyErrorsPlugin((options) => {
            options.clearConsole = true;
            options.additionalFormatters = [];
        });

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).to.be.instanceof(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).to.equal(true);
        expect(plugin.formatters.length).to.equal(3);
        expect(plugin.transformers.length).to.equal(6);
    });

    it('with options callback that returns an object', () => {
        const config = createConfig();

        config.configureFriendlyErrorsPlugin((options) => {
            options.clearConsole = false;

            // This should override the original config
            return { additionalFormatters: [] };
        });

        const plugin = friendlyErrorsPluginUtil(config);
        expect(plugin).to.be.instanceof(FriendlyErrorsWebpackPlugin);
        expect(plugin.shouldClearConsole).to.equal(true);
        expect(plugin.formatters.length).to.equal(3);
        expect(plugin.transformers.length).to.equal(3);
    });
});
