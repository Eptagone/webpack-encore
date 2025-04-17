/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type FriendlyErrorsWebpackPlugin from '@nuxt/friendly-errors-webpack-plugin';
import pc from 'picocolors';
import type { InnerCallback } from 'tapable';
import type { Compilation, Compiler, WebpackPluginInstance } from 'webpack';

class AssetOutputDisplayPlugin implements WebpackPluginInstance {
    constructor(private outputPath: string, private friendlyErrorsPlugin: FriendlyErrorsWebpackPlugin) { }

    public apply(compiler: Compiler) {
        const emit = (compilation: Compilation, callback: InnerCallback<Error, void>) => {
            // completely reset messages key to avoid adding more and more messages
            // when using watch
            this.friendlyErrorsPlugin.compilationSuccessInfo.messages = [
                `${pc.yellow(Object.keys(compilation.assets).length)} files written to ${pc.yellow(this.outputPath)}`,
            ];

            callback();
        };

        compiler.hooks.emit.tapAsync(
            { name: 'AssetOutputDisplayPlugin' },
            emit,
        );
    }
}

export default AssetOutputDisplayPlugin;
