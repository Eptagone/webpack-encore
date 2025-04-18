/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getVueVersion from '../../utils/get-vue-version.ts';
import type WebpackConfig from '../../WebpackConfig.ts';
import type { FriendlyError } from '../errors.ts';

const TYPE = 'loader-not-enabled';

function isMissingLoaderError(e: FriendlyError) {
    if (e.name !== 'ModuleParseError') {
        return false;
    }

    if (e.message && !/You may need an (appropriate|additional) loader/.test(e.message)) {
        return false;
    }

    return true;
}

function isErrorFromVueLoader(filename: string) {
    // vue3
    if (/vue-loader\/dist(\/index\.js)?\?\?/.test(filename)) {
        return true;
    }

    // later vue3 variant
    if (filename.includes('?vue') && filename.includes('lang=')) {
        return true;
    }

    return false;
}

function getFileExtension(filename: string) {
    // ??vue-loader-options
    if (isErrorFromVueLoader(filename)) {
        // vue is strange, the "filename" is reported as something like
        // vue3: /path/to/project/node_modules/vue-loader/dist??ref--4-0!./vuejs/App.vue?vue&type=style&index=1&lang=scss
        const langPos = filename.indexOf('lang=') + 5;
        let endLangPos = filename.indexOf('&', langPos);
        if (endLangPos === -1) {
            endLangPos = filename.length;
        }

        return filename.substring(langPos, endLangPos);
    }

    const str = filename.replace(/\?.*/, '');
    const split = str.split('.');

    return split.pop();
}

function transform(error: FriendlyError, webpackConfig: WebpackConfig) {
    if (!isMissingLoaderError(error)) {
        return error;
    }

    error = Object.assign({}, error);
    error.isVueLoader = isErrorFromVueLoader(error.file);

    const extension = getFileExtension(error.file);
    switch (extension) {
        case 'sass':
        case 'scss':
            error.loaderName = 'sass';
            break;
        case 'less':
            error.loaderName = 'less';
            break;
        case 'jsx':
            error.loaderName = 'react';
            break;
        case 'vue':
            error.loaderName = 'vue' + getVueVersion(webpackConfig);
            break;
        case 'tsx':
        case 'ts':
            error.loaderName = 'typescript';
            break;
        // add more as needed
        default:
            return error;
    }

    error.type = TYPE;
    error.severity = 900;
    error.name = 'Loader not enabled';

    return error;
}

/*
 * Returns a factory to get the function.
 */
export default function (webpackConfig: WebpackConfig) {
    return function (error: FriendlyError) {
        return transform(error, webpackConfig);
    };
};
