/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type WebpackConfig from '../WebpackConfig.ts';
import type { ValidatedWebpackConfig } from '../WebpackConfig.ts';

import * as logger from '../logger.ts';
import * as pathUtil from './path-util.ts';

class Validator {
    public webpackConfig: WebpackConfig;

    constructor(webpackConfig: WebpackConfig) {
        this.webpackConfig = webpackConfig;
    }

    validate() {
        this._validateBasic();

        this._validatePublicPathAndManifestKeyPrefix();

        this._validateDevServer();

        this._validateCacheGroupNames();
    }

    _validateBasic() {
        if (this.webpackConfig.outputPath === null) {
            throw new Error('Missing output path: Call setOutputPath() to control where the files will be written.');
        }

        if (this.webpackConfig.publicPath === null) {
            throw new Error('Missing public path: Call setPublicPath() to control the public path relative to where the files are written (the output path).');
        }

        if (this.webpackConfig.entries.size === 0
            && this.webpackConfig.styleEntries.size === 0
            && this.webpackConfig.copyFilesConfigs.length === 0
            && this.webpackConfig.plugins.length === 0
        ) {
            throw new Error('No entries found! You must call addEntry() or addEntries() or addStyleEntry() or copyFiles() or addPlugin() at least once - otherwise... there is nothing to webpack!');
        }
    }

    _validatePublicPathAndManifestKeyPrefix() {
        pathUtil.validatePublicPathAndManifestKeyPrefix(this.webpackConfig);
    }

    _validateDevServer() {
        if (!this.webpackConfig.useDevServer()) {
            return;
        }

        if (this.webpackConfig.useVersioning) {
            throw new Error('Don\'t enable versioning with the dev-server. A good setting is Encore.enableVersioning(Encore.isProduction()).');
        }

        /*
         * An absolute publicPath is incompatible with webpackDevServer.
         * This is because we want to *change* the publicPath to point
         * to the webpackDevServer URL (e.g. http://localhost:8080/).
         * There are some valid use-cases for not wanting this behavior
         * (see #59), but we want to warn the user.
         */
        if (this.webpackConfig.publicPath?.includes('://')) {
            logger.warning(`Passing an absolute URL to setPublicPath() *and* using the dev-server can cause issues. Your assets will load from the publicPath (${this.webpackConfig.publicPath}) instead of from the dev server URL.`);
        }
    }

    _validateCacheGroupNames() {
        for (const groupName of Object.keys(this.webpackConfig.cacheGroups)) {
            if (['defaultVendors', 'default'].includes(groupName)) {
                logger.warning(`Passing "${groupName}" to addCacheGroup() is not recommended, as it will override the built-in cache group by this name.`);
            }
        }
    }
}

/**
 * @param webpackConfig - The WebpackConfig object to validate
 */
export default function (webpackConfig: WebpackConfig | ValidatedWebpackConfig): asserts webpackConfig is ValidatedWebpackConfig {
    const validator = new Validator(webpackConfig);

    validator.validate();
};
