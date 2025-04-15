/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as cssLoader from '../../src/lib/loaders/css.ts';
import * as stylusLoader from '../../src/lib/loaders/stylus.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/stylus', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = stylusLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.false;
        // @ts-expect-error The method restore() doesn't exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableStylusLoader(function (stylusOptions) {
            stylusOptions.custom_option = 'foo';
            stylusOptions.other_option = true;
        });

        const actualLoaders = stylusLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options).to.deep.equals({
            sourceMap: true,
            custom_option: 'foo',
            other_option: true,
        });
        // @ts-expect-error The method restore() doesn't exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableStylusLoader(function (stylusOptions) {
            stylusOptions.custom_option = 'foo';

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = stylusLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options).to.deep.equals({ foo: true });
        // @ts-expect-error The method restore() doesn't exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with CSS modules enabled', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = stylusLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.true;
        // @ts-expect-error The method restore() doesn't exist
        cssLoader.getLoaders.restore();
    });
});
