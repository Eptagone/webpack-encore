/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import TerserPlugin from 'terser-webpack-plugin';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.ts';

export default function (webpackConfig: WebpackConfig): TerserPlugin {
    const terserPluginOptions = {
        parallel: true,
    };

    return new TerserPlugin(
        applyOptionsCallback(webpackConfig.terserPluginOptionsCallback, terserPluginOptions),
    );
};
