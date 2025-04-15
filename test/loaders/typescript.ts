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

describe('loaders/typescript', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableTypeScriptLoader(function (config) {
            config.foo = 'bar';
        });

        const actualLoaders = tsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        // callback is used
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options.foo).to.equal('bar');
    });

    it('getLoaders() check defaults configuration values', () => {
        const config = createConfig();
        config.enableTypeScriptLoader(function (config) {
            config.foo = 'bar';
        });

        const actualLoaders = tsLoader.getLoaders(config);
        // callback is used
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options.foo).to.equal('bar');
        // defaults
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options.silent).to.be.true;
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableTypeScriptLoader(function (config) {
            config.foo = false;

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = tsLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options).to.deep.equal({ foo: true });
    });
});
