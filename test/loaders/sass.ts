/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as cssLoader from '../../src/lib/loaders/css.ts';
import * as sassLoader from '../../src/lib/loaders/sass.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/sass', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0]!.loader).to.contain('resolve-url-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.sourceMap).to.be.true;

        expect(actualLoaders[1]!.loader).to.contain('sass-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1]!.options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.false;

        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with resolve-url-loader but not sourcemaps', () => {
        const config = createConfig();
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0]!.loader).to.contain('resolve-url-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.sourceMap).to.be.false;

        expect(actualLoaders[1]!.loader).to.contain('sass-loader');
        // sourcemaps always enabled when resolve-url-loader is enabled
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1]!.options.sourceMap).to.be.true;
        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with resolve-url-loader options', () => {
        const config = createConfig();
        config.enableSassLoader(() => { }, {
            resolveUrlLoaderOptions: {
                removeCR: true,
            },
        });

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0]!.loader).to.contain('resolve-url-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.removeCR).to.be.true;
        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() without resolve-url-loader', () => {
        const config = createConfig();
        config.enableSassLoader(() => { }, {
            resolveUrlLoader: false,
        });
        config.enableSourceMaps(false);

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0]!.loader).to.contain('sass-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.sourceMap).to.be.false;
        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableSassLoader(function (options) {
            options.sassOptions.custom_option = 'baz';
            options.sassOptions.other_option = true;
        });

        const actualLoaders = sassLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options).to.deep.equals({
            sourceMap: true,
            sassOptions: {
                outputStyle: 'expanded',
                custom_option: 'baz',
                other_option: true,
            },
        });
        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();

        // make the cssLoader return nothing
        sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        config.enableSassLoader(function (options) {
            options.custom_option = 'baz';

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = sassLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1].options).to.deep.equals({ foo: true });
        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });

    it('getLoaders() with CSS modules enabled', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        // make the cssLoader return nothing
        const cssLoaderStub = sinon.stub(cssLoader, 'getLoaders')
            .callsFake(() => []);

        const actualLoaders = sassLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(2);
        expect(actualLoaders[0]!.loader).to.contain('resolve-url-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.sourceMap).to.be.true;

        expect(actualLoaders[1]!.loader).to.contain('sass-loader');
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[1]!.options.sourceMap).to.be.true;
        expect(cssLoaderStub.getCall(0).args[1]).to.be.true;
        // @ts-expect-error The method restore() does not exist
        cssLoader.getLoaders.restore();
    });
});
