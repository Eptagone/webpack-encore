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
import sinon from 'sinon';
import { fileURLToPath } from 'url';
import api from '../src/index.mts';

const __filename = path.basename(fileURLToPath(import.meta.url));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Public API', () => {
    beforeEach(() => {
        process.chdir(path.join(__dirname, '..'));
        // @ts-expect-error There is no a 3rd argument
        api.configureRuntimeEnvironment('dev', {}, false);
    });

    describe('setOutputPath', () => {
        it('must return the API object', () => {
            const returnedValue = api.setOutputPath('/');
            expect(returnedValue).to.equal(api);
        });
    });

    describe('setPublicPath', () => {
        it('must return the API object', () => {
            const returnedValue = api.setPublicPath('/');
            expect(returnedValue).to.equal(api);
        });
    });

    describe('setManifestKeyPrefix', () => {
        it('must return the API object', () => {
            const returnedValue = api.setManifestKeyPrefix('/build');
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addEntry', () => {
        it('must return the API object', () => {
            const returnedValue = api.addEntry('entry', 'main.js');
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addStyleEntry', () => {
        it('must return the API object', () => {
            const returnedValue = api.addStyleEntry('styleEntry', 'main.css');
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addPlugin', () => {
        it('must return the API object', () => {
            // @ts-expect-error This should be possible
            const returnedValue = api.addPlugin(null);
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addLoader', () => {
        it('must return the API object', () => {
            // @ts-expect-error This should be possible
            const returnedValue = api.addLoader(null);
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addRule', () => {
        it('must return the API object', () => {
            // @ts-expect-error This should be possible
            const returnedValue = api.addRule(null);
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addAliases', () => {
        it('must return the API object', () => {
            const returnedValue = api.addAliases({});
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addExternals', () => {
        it('must return the API object', () => {
            const returnedValue = api.addExternals({});
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableVersioning', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableVersioning();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableSourceMaps', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableSourceMaps();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('addCacheGroup', () => {
        it('must return the API object', () => {
            const returnedValue = api.addCacheGroup('sharedEntry', {
                test: /vendor\.js/,
            });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('copyFiles', () => {
        it('must return the API object', () => {
            const returnedValue = api.copyFiles({ from: './foo' });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableSingleRuntimeChunk', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableSingleRuntimeChunk();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('disableSingleRuntimeChunk', () => {
        it('must return the API object', () => {
            const returnedValue = api.disableSingleRuntimeChunk();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('splitEntryChunks', () => {
        it('must return the API object', () => {
            const returnedValue = api.splitEntryChunks();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureSplitChunks', () => {
        it('must return the API object', () => {
            const returnedValue = api.configureSplitChunks(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('autoProvideVariables', () => {
        it('must return the API object', () => {
            const returnedValue = api.autoProvideVariables({});
            expect(returnedValue).to.equal(api);
        });
    });

    describe('autoProvidejQuery', () => {
        it('must return the API object', () => {
            const returnedValue = api.autoProvidejQuery();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enablePostCssLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enablePostCssLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableSassLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableSassLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableLessLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableLessLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableStylusLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableStylusLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureBabel', () => {
        it('must return the API object', () => {
            const returnedValue = api.configureBabel(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureBabelPresetEnv', () => {
        it('must return the API object', () => {
            const returnedValue = api.configureBabelPresetEnv(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableReactPreset', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableReactPreset();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableSvelte', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableSvelte();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enablePreactPreset', () => {
        it('must return the API object', () => {
            const returnedValue = api.enablePreactPreset();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableTypeScriptLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableTypeScriptLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableForkedTypeScriptTypesChecking', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableForkedTypeScriptTypesChecking();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableVueLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableVueLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableBuildNotifications', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableBuildNotifications();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableHandlebarsLoader', () => {
        it('must return the API object', () => {
            const returnedValue = api.enableHandlebarsLoader();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('disableCssExtraction', () => {
        it('must return the API object', () => {
            const returnedValue = api.disableCssExtraction();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureFilenames', () => {
        it('must return the API object', () => {
            const returnedValue = api.configureFilenames({});
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureImageRule', () => {
        it('must return the API object', () => {
            const returnedValue = api.configureImageRule();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureFontRule', () => {
        it('must return the API object', () => {
            const returnedValue = api.configureFontRule();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('cleanupOutputBeforeBuild', () => {
        it('must return the API object', () => {
            const returnedValue = api.cleanupOutputBeforeBuild();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureRuntimeEnvironment', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureRuntimeEnvironment('dev');
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureDefinePlugin', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureDefinePlugin(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureFriendlyErrorsPlugin', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureFriendlyErrorsPlugin(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureManifestPlugin', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureManifestPlugin(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureTerserPlugin', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureTerserPlugin(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureCssMinimizerPlugin', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureCssMinimizerPlugin(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableStimulusBridge', () => {
        it('should return the API object', () => {
            const returnedValue = api.enableStimulusBridge(path.resolve(__dirname, '../', 'package.json'));
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableBuildCache', () => {
        it('should return the API object', () => {
            const returnedValue = api.enableBuildCache({ config: [__filename] });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('configureMiniCssExtractPlugin', () => {
        it('should return the API object', () => {
            const returnedValue = api.configureMiniCssExtractPlugin(() => { });
            expect(returnedValue).to.equal(api);
        });
    });

    describe('enableIntegrityHashes', () => {
        it('should return the API object', () => {
            const returnedValue = api.enableIntegrityHashes();
            expect(returnedValue).to.equal(api);
        });
    });

    describe('when', () => {
        it('should call or not callbacks depending of the conditions', () => {
            // @ts-expect-error There is no a 3rd argument
            api.configureRuntimeEnvironment('dev', {}, false);

            const spy = sinon.spy();
            api
                .when(Encore => Encore.isDev(), _Encore => spy('is dev'))
                .when(Encore => Encore.isProduction(), _Encore => spy('is production'))
                .when(true, _Encore => spy('true'));
            expect(spy.calledWith('is dev'), 'callback for "is dev" should be called').to.be.true;
            expect(spy.calledWith('is production'), 'callback for "is production" should NOT be called').to.be.false;
            expect(spy.calledWith('true'), 'callback for "true" should be called').to.be.true;
        });
    });

    describe('isRuntimeEnvironmentConfigured', () => {
        it('should return true if the runtime environment has been configured', () => {
            const returnedValue = api.isRuntimeEnvironmentConfigured();
            expect(returnedValue).to.be.true;
        });

        it('should return false if the runtime environment has not been configured', () => {
            api.clearRuntimeEnvironment();

            const returnedValue = api.isRuntimeEnvironmentConfigured();
            expect(returnedValue).to.be.false;
        });
    });

    describe('Runtime environment proxy', () => {
        beforeEach(() => {
            api.clearRuntimeEnvironment();
        });

        it('safe methods should be callable even if the runtime environment has not been configured', () => {
            expect(() => api.clearRuntimeEnvironment()).to.not.throw();
        });

        it('unsafe methods should NOT be callable if the runtime environment has not been configured', () => {
            expect(() => api.setOutputPath('/')).to.throw('Encore.setOutputPath() cannot be called yet');
        });
    });
});
