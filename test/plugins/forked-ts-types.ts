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
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as tsLoader from '../../src/lib/loaders/typescript.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('plugins/forkedtypecheck', () => {
    it('getPlugins() basic usage', async () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking();

        expect(config.plugins).to.have.lengthOf(0);
        const tsTypeChecker = (await import('../../src/lib/plugins/forked-ts-types.ts')).default;
        tsTypeChecker(config);
        expect(config.plugins).to.have.lengthOf(1);
        expect(config.plugins[0]!.plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0]!.plugin.options.silent).to.be.undefined;
        // after enabling plugin, check typescript loader has right config
        const actualLoaders = tsLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options.transpileOnly).to.be.true;
    });

    it('getPlugins() with options callback', async () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking(function (options) {
            options.async = true;
        });

        expect(config.plugins).to.have.lengthOf(0);
        const tsTypeChecker = (await import('../../src/lib/plugins/forked-ts-types.ts')).default;
        tsTypeChecker(config);
        expect(config.plugins).to.have.lengthOf(1);
        expect(config.plugins[0]!.plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0]!.plugin.options.async).to.equal(true);
    });

    it('getPlugins() with options callback that returns an object', async () => {
        const config = createConfig();
        config.enableTypeScriptLoader();
        config.enableForkedTypeScriptTypesChecking(function (options) {
            options.silent = true;

            // This should override the original config
            return { async: true };
        });

        expect(config.plugins).to.have.lengthOf(0);
        const tsTypeChecker = (await import('../../src/lib/plugins/forked-ts-types.ts')).default;
        tsTypeChecker(config);
        expect(config.plugins).to.have.lengthOf(1);
        expect(config.plugins[0]!.plugin).to.be.an.instanceof(ForkTsCheckerWebpackPlugin);
        expect(config.plugins[0]!.plugin.options.silent).to.be.undefined;
        expect(config.plugins[0]!.plugin.options.async).to.equal(true);
    });
});
