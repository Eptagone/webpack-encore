/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type RuntimeConfig from './config/RuntimeConfig.ts';

/**
 * Stores the current RuntimeConfig created by the encore executable.
 */
const Config: {
    runtimeConfig: RuntimeConfig | null;
} = {
    get runtimeConfig(): RuntimeConfig | null {
        return globalThis.WEBPACK_ENCORE_RUNTIME_CONFIG || null;
    },
    set runtimeConfig(config: RuntimeConfig) {
        globalThis.WEBPACK_ENCORE_RUNTIME_CONFIG = config;
    },
};

export default Config;
