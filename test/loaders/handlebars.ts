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
import * as handlebarsLoader from '../../src/lib/loaders/handlebars.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/handlebars', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.enableHandlebarsLoader();

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0]!.options).to.be.empty;
    });

    it('getLoaders() with options callback', () => {
        const config = createConfig();
        config.enableHandlebarsLoader((options) => {
            options.debug = true;
        });

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.debug).to.be.true;
    });

    it('getLoaders() with options callback that returns an object', () => {
        const config = createConfig();
        config.enableHandlebarsLoader((options) => {
            options.debug = true;

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = handlebarsLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0]!.options).to.deep.equal({ foo: true });
    });
});
