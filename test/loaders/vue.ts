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
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as vueLoader from '../../src/lib/loaders/vue.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/vue', () => {
    it('getLoaders() with extra options', () => {
        const config = createConfig();
        config.enableVueLoader((options) => {
            options.postLoaders = { foo: 'foo-loader' };
        });

        const actualLoaders = vueLoader.getLoaders(config);

        expect(actualLoaders).to.have.lengthOf(1);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.postLoaders.foo).to.equal('foo-loader');
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enableVueLoader((options) => {
            options.postLoaders = { foo: 'foo-loader' };

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = vueLoader.getLoaders(config);

        expect(actualLoaders).to.have.lengthOf(1);
        expect(actualLoaders[0]!.options).to.deep.equal({ foo: true });
    });
});
