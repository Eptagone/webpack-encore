/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import applyOptionsCallback from '../utils/apply-options-callback.ts';
import type WebpackConfig from '../WebpackConfig.ts';

/**
 * @param webpackConfig -
 * @returns
 */
export default function (webpackConfig: WebpackConfig): object {
    const minimizerPluginOptions = {};

    return new CssMinimizerPlugin(
        applyOptionsCallback(webpackConfig.cssMinimizerPluginOptionsCallback, minimizerPluginOptions),
    );
};
