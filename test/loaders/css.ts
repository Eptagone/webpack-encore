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
import * as cssLoader from '../../src/lib/loaders/css.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/css', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableSourceMaps(true);

        const actualLoaders = cssLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.sourceMap).to.be.true;
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.modules).to.be.false;
    });

    it('getLoaders() for production', () => {
        const config = createConfig();
        config.enableSourceMaps(false);
        config.runtimeConfig.environment = 'production';

        const actualLoaders = cssLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.sourceMap).to.be.false;
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.modules).to.be.false;
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();

        config.configureCssLoader(function (options) {
            // @ts-expect-error It's okey. It's a test
            options.foo = true;
            options.url = false;
        });

        const actualLoaders = cssLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.foo).to.be.true;
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.url).to.be.false;
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.modules).to.be.false;
    });

    it('getLoaders() with CSS modules enabled', () => {
        const config = createConfig();

        config.configureCssLoader(function (options) {
            // @ts-expect-error It's okey. It's a test
            options.foo = true;
            options.url = false;
        });

        const actualLoaders = cssLoader.getLoaders(config, true);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.foo).to.be.true;
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.url).to.be.false;
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.modules).to.deep.equals({
            localIdentName: '[local]_[hash:base64:5]',
        });
    });

    describe('getLoaders() with PostCSS', () => {
        it('without options callback', () => {
            const config = createConfig();
            config.enableSourceMaps();
            config.enablePostCssLoader();

            const actualLoaders = cssLoader.getLoaders(config);
            // css-loader & postcss-loader
            expect(actualLoaders).to.have.lengthOf(2);
            // @ts-expect-error It's okey. It's a test
            expect(actualLoaders[1]!.options.sourceMap).to.be.true;
        });

        it('with options callback', () => {
            const config = createConfig();
            config.enableSourceMaps();
            config.enablePostCssLoader((options) => {
                options.config = {
                    path: 'config/postcss.config.js',
                };
            });

            const actualLoaders = cssLoader.getLoaders(config);
            // css-loader & postcss-loader
            expect(actualLoaders).to.have.lengthOf(2);
            // @ts-expect-error It's okey. It's a test
            expect(actualLoaders[1].options.sourceMap).to.be.true;
            // @ts-expect-error It's okey. It's a test
            expect(actualLoaders[1].options.config.path).to.equal('config/postcss.config.js');
        });

        it('with options callback that returns an object', () => {
            const config = createConfig();
            config.enableSourceMaps(true);
            config.enablePostCssLoader((options) => {
                options.config = {
                    path: 'config/postcss.config.js',
                };

                // This should override the original config
                return { foo: true };
            });

            const actualLoaders = cssLoader.getLoaders(config);
            // css-loader & postcss-loader
            expect(actualLoaders).to.have.lengthOf(2);
            expect(actualLoaders[1]!.options).to.deep.equal({ foo: true });
        });
    });
});
