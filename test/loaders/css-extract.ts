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
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as cssExtractLoader from '../../src/lib/loaders/css-extract.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/css-extract', () => {
    it('prependLoaders() basic usage', () => {
        const config = createConfig();

        // @ts-expect-error It's okey. It's a test
        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).to.have.lengthOf(2);
        // @ts-expect-error It's okey. It's a test
        expect(loaders[0].loader).to.equal(MiniCssExtractPlugin.loader);
    });

    it('prependLoaders() with CSS extraction disabled', () => {
        const config = createConfig();
        config.disableCssExtraction();
        config.enableSourceMaps(true);

        // @ts-expect-error It's okey. It's a test
        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).to.have.lengthOf(2);
        // @ts-expect-error It's okey. It's a test
        expect(loaders[0].loader).to.contain('style-loader');
    });

    it('prependLoaders() options callback', () => {
        const config = createConfig();
        config.configureMiniCssExtractPlugin((options) => {
            // @ts-expect-error It's okey. It's a test
            options.ignoreOrder = true;
        });

        // @ts-expect-error It's okey. It's a test
        const loaders = cssExtractLoader.prependLoaders(config, ['foo']);

        expect(loaders).to.have.lengthOf(2);
        // @ts-expect-error It's okey. It's a test
        expect(loaders[0].loader).to.equal(MiniCssExtractPlugin.loader);
        // @ts-expect-error It's okey. It's a test
        expect(loaders[0].options.ignoreOrder).to.be.true;
    });
});
