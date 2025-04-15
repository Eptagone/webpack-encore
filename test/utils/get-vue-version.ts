/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import { fileURLToPath } from 'url';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as packageHelper from '../../src/lib/package-helper.ts';
import getVueVersion from '../../src/lib/utils/get-vue-version.ts';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createWebpackConfig = function () {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.environment = 'dev';
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
};

describe('get-vue-version', () => {
    let getPackageVersionStub: ReturnType<typeof sinon.stub> = null;
    before(() => {
        getPackageVersionStub = sinon.stub(packageHelper, 'getPackageVersion');
    });
    // !The method restore() does not exist
    // after(() => {
    //     packageHelper.getPackageVersion.restore();
    // });

    it('returns the value configured in Webpack.config.js', () => {
        const config = createWebpackConfig();
        config.vueOptions.version = 4;

        expect(getVueVersion(config)).to.equal(4);
    });

    it('returns the default recommended version when vue is not installed', () => {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => null);

        expect(getVueVersion(config)).to.equal(3);
    });

    it('throw an error when Vue 2 is installed', () => {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '2.2.4');

        expect(() => getVueVersion(config)).to.throw('vue version 2 is not supported.');
    });

    it('returns 3 when Vue 3 beta is installed', () => {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '3.0.0-beta.9');

        expect(getVueVersion(config)).to.equal(3);
    });

    it('returns 3 when Vue 3 is installed', () => {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '3.0.0');

        expect(getVueVersion(config)).to.equal(3);
    });

    it('returns 3 when a version is too new', () => {
        const config = createWebpackConfig();
        getPackageVersionStub
            .callsFake(() => '4.0.0'); // unsupported version

        expect(getVueVersion(config)).to.equal(3);
    });
});
