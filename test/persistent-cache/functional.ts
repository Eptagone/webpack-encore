/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as chai from 'chai';
import chaiFs from 'chai-fs';
import chaiSubset from 'chai-subset';
import path from 'path';
import { fileURLToPath } from 'url';
import * as testSetup from '../helpers/setup.ts';

chai.use(chaiFs);
chai.use(chaiSubset);

const __filename = path.basename(fileURLToPath(import.meta.url));

function createWebpackConfig(outputDirName: string = '', testName: string, command: string, argv = {}) {
    // We need a static named test dir for the cache to work
    const testAppDir = testSetup.createTestAppDir(null, testName + '/test');
    const webpackConfig = testSetup.createWebpackConfig(
        testAppDir,
        outputDirName,
        command,
        argv,
    );

    webpackConfig.enableSingleRuntimeChunk();
    webpackConfig.enableBuildCache({ config: [__filename] }, (cache) => {
        cache.cacheDirectory = path.resolve(testAppDir, '..', '.webpack-cache');
    });

    return webpackConfig;
}

describe('Functional persistent cache tests using webpack', function () {
    // being functional tests, these can take quite long
    this.timeout(10000);

    describe('Basic scenarios.', () => {
        it('Persistent caching does not cause problems', (done) => {
            const config = createWebpackConfig('www/build', 'basic_cache', 'dev');
            config.setPublicPath('/build');
            config.addEntry('main', './js/code_splitting');

            testSetup.runWebpack(config, (webpackAssert) => {
                // sanity check
                webpackAssert.assertManifestPath(
                    'build/main.js',
                    '/build/main.js',
                );

                done();
            });
        });
    });

    describe('copyFiles() allows to copy files and folders', () => {
        it('Persistent caching does not cause problems', (done) => {
            const config = createWebpackConfig('www/build', 'copy_files_cache', 'production');
            config.addEntry('main', './js/no_require');
            config.setPublicPath('/build');
            config.enableVersioning(true);
            config.copyFiles([{
                from: './images',
                includeSubdirectories: false,
            }]);

            testSetup.runWebpack(config, (webpackAssert) => {
                webpackAssert.assertDirectoryContents([
                    'entrypoints.json',
                    'runtime.[hash:8].js',
                    'main.[hash:8].js',
                    'manifest.json',
                    'symfony_logo.[hash:8].png',
                    'symfony_logo_alt.[hash:8].png',
                ]);

                webpackAssert.assertManifestPath(
                    'build/symfony_logo.png',
                    '/build/symfony_logo.91beba37.png',
                );

                webpackAssert.assertManifestPath(
                    'build/symfony_logo_alt.png',
                    '/build/symfony_logo_alt.f880ba14.png',
                );

                done();
            });
        });
    });
});
