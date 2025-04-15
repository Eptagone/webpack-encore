/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@nuxt/friendly-errors-webpack-plugin' {
    class FriendlyErrorsWebpackPlugin {
        constructor(options?: any): this;

        [key: string]: any;
        apply(compiler: import('webpack').Compiler): void;
    }

    export default FriendlyErrorsWebpackPlugin;
}
