/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import webpack from 'webpack';
import yargsParser from 'yargs-parser';
import WebpackConfig, { type BabelOptions, type CopyFilesOptions, type CssLoaderOptions, type FilenamesOptions, type FontRuleOptions, type ImageRuleOptions, type PreactPresetEncoreOptions, type SassLoaderEncoreOptions, type VueLoaderEncoreOptions } from './WebpackConfig.ts';
import configGenerator, { type DevServerOptions } from './config-generator.ts';
import parseRuntime from './config/parse-runtime.ts';
import validator from './config/validator.ts';
import context from './context.ts';
import type { BabelConfiguration, BabelPresetEnvOptions } from './loaders/babel.ts';
import type { OptionsCallback } from './utils/apply-options-callback.ts';

let runtimeConfig = context.runtimeConfig;
let webpackConfig = runtimeConfig
    ? new WebpackConfig(runtimeConfig)
    : null;

export default class Encore {
    /**
     * The directory where your files should be output.
     *
     * If relative (e.g. web/build), it will be set relative
     * to the directory where your package.json lives.
     *
     * @param outputPath -
     * @returns
     */
    setOutputPath(outputPath: string): Encore {
        webpackConfig?.setOutputPath(outputPath);

        return this;
    }

    /**
     * The public version of outputPath: the public path to outputPath.
     *
     * For example, if "web" is your document root, then:
     *
     * ```
     * Encore
     *     .setOutputPath('web/build')
     *     .setPublicPath('/build')
     * ```
     *
     * This can also be set to an absolute URL if you're using
     * a CDN: publicPath is used as the prefix to all asset paths
     * in the manifest.json file and internally in webpack:
     *
     * ```
     * Encore
     *     .setOutputPath('web/build')
     *     .setPublicPath('https://coolcdn.com')
     *     // needed when public path is absolute
     *     .setManifestKeyPrefix('/build')
     * ```
     *
     * @param publicPath -
     */
    setPublicPath(publicPath: string): Encore {
        webpackConfig?.setPublicPath(publicPath);

        return this;
    }

    /**
     * Used as a prefix to the *keys* in manifest.json. Not usually needed.
     *
     * You don't normally need to set this. When you *do* need to set
     * it, an error will notify you.
     *
     * Typically, publicPath is used in the keys inside manifest.json.
     * But if publicPath is absolute, then we require you to set this.
     * For example:
     *
     * ```
     * Encore
     *     .setOutputPath('web/build')
     *     .setPublicPath('https://coolcdn.com/FOO')
     *     .setManifestKeyPrefix('build/')
     * ```
     *
     * The manifest.json file would look something like this:
     *
     * ```
     * {
     *     "build/main.js": "https://coolcdn.com/FOO/main.a54f3ccd2.js"
     * }
     * ```
     *
     * @param manifestKeyPrefix -
     */
    setManifestKeyPrefix(manifestKeyPrefix: string): Encore {
        webpackConfig?.setManifestKeyPrefix(manifestKeyPrefix);

        return this;
    }

    /**
     * Allows you to configure the options passed to the DefinePlugin.
     * A list of available options can be found at https://webpack.js.org/plugins/define-plugin/
     *
     * For example:
     *
     * ```
     * Encore.configureDefinePlugin((options) => {
     *     options.VERSION = JSON.stringify('1.0.0');
     * })
     * ```
     *
     * @param definePluginOptionsCallback -
     */
    configureDefinePlugin(definePluginOptionsCallback: OptionsCallback<ConstructorParameters<typeof webpack.DefinePlugin>[0]> = () => { }): Encore {
        webpackConfig?.configureDefinePlugin(definePluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the \@nuxt/friendly-errors-webpack-plugin.
     * A list of available options can be found at https://github.com/nuxt/friendly-errors-webpack-plugin
     *
     * For example:
     *
     * ```
     * Encore.configureFriendlyErrorsPlugin((options) => {
     *     options.clearConsole = true;
     * })
     * ```
     *
     * @param friendlyErrorsPluginOptionsCallback -
     */
    configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to webpack-manifest-plugin.
     * A list of available options can be found at https://github.com/danethurber/webpack-manifest-plugin
     *
     * For example:
     *
     * ```
     * Encore.configureManifestPlugin((options) => {
     *     options.fileName = '../../var/assets/manifest.json';
     * })
     * ```
     *
     * @param manifestPluginOptionsCallback -
     * @returns
     */
    configureManifestPlugin(manifestPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.configureManifestPlugin(manifestPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the terser-webpack-plugin.
     * A list of available options can be found at https://github.com/webpack-contrib/terser-webpack-plugin
     *
     * For example:
     *
     * ```
     * Encore.configureTerserPlugin((options) => {
     *     options.cache = true;
     *     options.terserOptions = {
     *         output: {
     *             comments: false
     *         }
     *     }
     * })
     * ```
     *
     * @param terserPluginOptionsCallback -
     * @returns
     */
    configureTerserPlugin(terserPluginOptionsCallback: OptionsCallback<import('terser-webpack-plugin').BasePluginOptions & import('terser-webpack-plugin').DefinedDefaultMinimizerAndOptions<import('terser').MinifyOptions>> = () => { }): Encore {
        webpackConfig?.configureTerserPlugin(terserPluginOptionsCallback);

        return this;
    }

    /**
     * Allows you to configure the options passed to the css-minimizer-webpack-plugin.
     * A list of available options can be found at https://github.com/webpack-contrib/css-minimizer-webpack-plugin
     *
     * For example:
     *
     * ```
     * Encore.configureCssMinimizerPlugin((options) => {
     *     options.parallel = false;
     * })
     * ```
     *
     * @param cssMinimizerPluginOptionsCallback -
     * @returns
     */
    configureCssMinimizerPlugin(cssMinimizerPluginOptionsCallback: OptionsCallback<import('css-minimizer-webpack-plugin').BasePluginOptions & import('css-minimizer-webpack-plugin').DefinedDefaultMinimizerAndOptions<import('css-minimizer-webpack-plugin').CssNanoOptionsExtended>> = () => { }): Encore {
        webpackConfig?.configureCssMinimizerPlugin(cssMinimizerPluginOptionsCallback);

        return this;
    }

    /**
     * Adds a JavaScript file that should be webpacked:
     *
     * ```
     * // final output file will be main.js in the output directory
     * Encore.addEntry('main', './path/to/some_file.js');
     * ```
     *
     * If the JavaScript file imports/requires CSS/Sass/LESS files,
     * then a CSS file (e.g. main.css) will also be output.
     *
     * @param name - The name (without extension) that will be used
     *          as the output filename (e.g. app will become app.js)
     *          in the output directory.
     * @param src - The path to the source file (or files)
     * @returns
     */
    addEntry(name: string, src: string | string[]): Encore {
        webpackConfig?.addEntry(name, src);

        return this;
    }

    /**
     * Adds a collection of JavaScript files that should be webpacked:
     *
     * ```
     * // final output file will be main.js in the output directory
     * Encore.addEntries({
     *   main: './path/to/some_file.js',
     *   secondary: './path/to/another_file.js',
     * });
     * ```
     *
     * If the JavaScript files imports/requires CSS/Sass/LESS files,
     * then a CSS file (e.g. main.css) will also be output.
     *
     * @param entries - entries where the Keys are the
     *                  names (without extension) that will be used
     *                  as the output filename (e.g. app will become app.js)
     *                  in the output directory. The values are the path(s)
     *                  to the source file(s).
     * @returns
     */
    addEntries(entries: Record<string, string | string[]>): Encore {
        webpackConfig?.addEntries(entries);

        return this;
    }

    /**
     * Adds a CSS/SASS/LESS file that should be webpacked:
     *
     * ```
     *  // final output file will be main.css in the output directory
     *  Encore.addStyleEntry('main', './path/to/some_file.css');
     * ```
     *
     * This is actually not something Webpack does natively, and you
     * should avoid using this function when possible. A better option
     * is to use addEntry() and then require/import your CSS files from
     * within your JavaScript files.
     *
     * @param name - The name (without extension) that will be used
     *                  as the output filename (e.g. app will become app.css)
     *                  in the output directory.
     * @param src - The path to the source file (or files)
     * @returns
     */
    addStyleEntry(name: string, src: string | string[]): Encore {
        webpackConfig?.addStyleEntry(name, src);

        return this;
    }

    /**
     * Add a plugin to the sets of plugins already registered by Encore
     *
     * For example, if you want to add the "webpack.IgnorePlugin()", then:
     *
     * ```
     * Encore.addPlugin(new webpack.IgnorePlugin(requestRegExp, contextRegExp))
     * ```
     *
     * By default custom plugins are added after the ones managed by Encore
     * but you can also set a priority to define where your plugin will be
     * added in the generated Webpack config.
     *
     * For example, if a plugin has a priority of 0 and you want to add
     * another plugin after it, then:
     *
     * ```
     * Encore.addPlugin(new MyWebpackPlugin(), -10)
     * ```
     *
     * The priority of each plugin added by Encore can be found in the
     * "lib/plugins/plugin-priorities.js" file. It is recommended to use
     * these constants if you want to add a plugin using the same priority
     * as one managed by Encore in order to avoid backward compatibility
     * breaks.
     *
     * For example, if you want one of your plugins to have the same priority
     * than the DefinePlugin:
     *
     * ```
     * const Encore = require('@symfony/webpack-encore');
     * const PluginPriorities = require('@symfony/webpack-encore/lib/plugins/plugin-priorities.js');
     *
     * Encore.addPlugin(new MyWebpackPlugin(), PluginPriorities.DefinePlugin);
     * ```
     *
     * @param plugin -
     * @param priority -
     */
    addPlugin(plugin: webpack.WebpackPluginInstance, priority: number = 0): Encore {
        webpackConfig?.addPlugin(plugin, priority);

        return this;
    }

    /**
     * Adds a custom loader config
     *
     * @param loader - The loader config object
     */
    addLoader(loader: webpack.RuleSetRule): Encore {
        webpackConfig?.addLoader(loader);

        return this;
    }

    /**
     * Alias to addLoader
     *
     * @param rule -
     */
    addRule(rule: webpack.RuleSetRule): Encore {
        this.addLoader(rule);

        return this;
    }

    /**
     * Allow you to add aliases that will be used by
     * Webpack when trying to resolve modules.
     *
     * See https://webpack.js.org/configuration/resolve/#resolve-alias
     *
     * For example:
     *
     * ```
     * Encore.addAliases({
     *     Utilities: path.resolve(__dirname, 'src/utilities/'),
     *     Templates: path.resolve(__dirname, 'src/templates/')
     * })
     * ```
     *
     * @param aliases -
     * @returns
     */
    addAliases(aliases: Record<string, string>): Encore {
        webpackConfig?.addAliases(aliases);

        return this;
    }

    /**
     * Allow you to exclude some dependencies from the output bundles.
     *
     * See https://webpack.js.org/configuration/externals/
     *
     * For example:
     *
     * ```
     * Encore.addExternals({
     *     jquery: 'jQuery',
     *     react: 'react'
     * });
     * ```
     *
     * Or:
     *
     * ```
     * const nodeExternals = require('webpack-node-externals');
     *
     * Encore.addExternals(
     *     nodeExternals()
     * );
     *
     * // or add multiple things at once
     * Encore.addExternals([
     *     nodeExternals(),
     *     /^(jquery|\$)$/i
     * ]);
     * ```
     *
     * @param externals -
     * @returns
     */
    addExternals(externals: webpack.Externals): Encore {
        webpackConfig?.addExternals(externals);

        return this;
    }

    /**
     * When enabled, files are rendered with a hash based
     * on their contents (e.g. main.a2b61cc.js)
     *
     * A manifest.json file will be rendered to the output
     * directory with a map from the original file path to
     * the versioned path (e.g. `builds/main.js` =\> `builds/main.a2b61cc.js`)
     *
     * Note that the versioning must be disabled if you
     * want to use the dev-server.
     *
     * For example:
     *
     * ```
     * Encore.enableVersioning(Encore.isProduction());
     * ```
     *
     * @param enabled -
     * @returns
     */
    enableVersioning(enabled: boolean = true): Encore {
        webpackConfig?.enableVersioning(enabled);

        return this;
    }

    /**
     * When enabled, all final CSS and JS files will be rendered
     * with sourcemaps to help debugging.
     *
     * The *type* of source map will differ between a development
     * or production build.
     *
     * For example if you want to always generate sourcemaps:
     *
     * ```
     * Encore.enableSourceMaps();
     * ```
     *
     * Or only enable them when not in production mode:
     *
     * ```
     * Encore.enableSourceMaps(!Encore.isProduction());
     * ```
     *
     * @param enabled -
     * @returns
     */
    enableSourceMaps(enabled: boolean = true): Encore {
        webpackConfig?.enableSourceMaps(enabled);

        return this;
    }

    /**
     * Add a new cache group to Webpack's SplitChunksPlugin.
     * This can, for instance, be used to extract code that
     * is common to multiple entries into its own chunk.
     *
     * See: https://webpack.js.org/plugins/split-chunks-plugin/#examples
     *
     * For example:
     *
     * ```
     * Encore.addCacheGroup('vendor', {
     *     test: /[\\/]node_modules[\\/]react/
     * });
     * ```
     *
     * You can pass all the options supported by the SplitChunksPlugin
     * but also the following shorthand provided by Encore:
     *
     * - `node_modules`: An array of `node_modules` packages names
     *
     * For example:
     *
     * ```
     * Encore.addCacheGroup('vendor', {
     *     node_modules: ['react', 'react-dom']
     * });
     * ```
     *
     * At least one of the `test` or the `node_modules` option
     * should be provided.
     *
     * By default, the new cache group will be created with the
     * following options:
     * - `chunks` set to `"all"`
     * - `enforce` set to `true`
     * - `name` set to the value of the "name" parameter
     *
     * @param name - The chunk name (e.g. vendor to create a vendor.js)
     * @param options - Cache group option
     * @returns
     */
    addCacheGroup(name: string, options: Record<string, any>): Encore {
        webpackConfig?.addCacheGroup(name, options);

        return this;
    }

    /**
     * Copy files or folders to the build directory.
     *
     * For example:
     *
     * ```
     * // Copy the content of a whole directory and its subdirectories
     * Encore.copyFiles({ from: './assets/images' });
     *
     * // Only copy files matching a given pattern
     * Encore.copyFiles({ from: './assets/images', pattern: /\.(png|jpg|jpeg)$/ })
     *
     * // Set the path the files are copied to
     * Encore.copyFiles({
     *     from: './assets/images',
     *     pattern: /\.(png|jpg|jpeg)$/,
     *     // to path is relative to the build directory
     *     to: 'images/[path][name].[ext]'
     * })
     *
     * // Version files
     * Encore.copyFiles({
     *     from: './assets/images',
     *     to: 'images/[path][name].[hash:8].[ext]'
     * })
     *
     * // Add multiple configs in a single call
     * Encore.copyFiles([
     *     { from: './assets/images' },
     *     { from: './txt', pattern: /\.txt$/ },
     * ]);
     *
     * // Set the context path: files will be copied
     * // into an images/ directory in the output dir
     * Encore.copyFiles({
     *     from: './assets/images',
     *     to: '[path][name].[hash:8].[ext]',
     *     context: './assets'
     * });
     * ```
     *
     * Notes:
     *      No transformation is applied to the copied files (for instance
     *        copying a CSS file won't minify it)
     * @param configs -
     * @returns
     */
    copyFiles(configs: CopyFilesOptions | CopyFilesOptions[]): Encore {
        webpackConfig?.copyFiles(configs);

        return this;
    }

    /**
     * Tell Webpack to output a separate runtime.js file.
     *
     * This file must be included via a script tag before all
     * other JavaScript files output by Encore.
     *
     * The runtime.js file is useful when you plan to include
     * multiple entry files on the same page (e.g. a layout.js entry
     * and a page-specific entry). If you are *not* including
     * multiple entries on the same page, you can safely disable
     * this - disableSingleRuntimeChunk() - and remove the extra script tags.
     *
     * If you *do* include multiple entry files on the same page,
     * disabling the runtime.js file has two important consequences:
     *  A) Each entry file will contain the Webpack runtime, which
     *     means each contains some code that is duplicated in the other.
     *  B) If two entry files require the same module (e.g. jquery),
     *     they will receive *different* objects - not the *same* object.
     *     This can cause some confusion if you expect a "layout.js" entry
     *     to be able to "initialize" some jQuery plugins, because the
     *     jQuery required by the other entry will be a different instance,
     *     and so won't have the plugins initialized on it.
     *
     * @returns
     */
    enableSingleRuntimeChunk(): Encore {
        webpackConfig?.enableSingleRuntimeChunk();

        return this;
    }

    /**
     * Tell Webpack to *not* output a separate runtime.js file.
     *
     * See enableSingleRuntimeChunk() for more details.
     *
     * @returns
     */
    disableSingleRuntimeChunk(): Encore {
        webpackConfig?.disableSingleRuntimeChunk();

        return this;
    }

    /**
     * Tell Webpack to "split" your entry chunks.
     *
     * This will mean that, instead of adding 1 script tag
     * to your page, your server-side code will need to read
     * the entrypoints.json file in the build directory to
     * determine the *multiple* .js (and .css) files that
     * should be included for each entry.
     *
     * This is a performance optimization, but requires extra
     * work (described above) to support this.
     *
     * @returns
     */
    splitEntryChunks(): Encore {
        webpackConfig?.splitEntryChunks();

        return this;
    }

    /**
     * Configure the optimization.splitChunks configuration.
     *
     * https://webpack.js.org/plugins/split-chunks-plugin/
     *
     * ```
     * Encore.configureSplitChunks(function(splitChunks) {
     *     // change the configuration
     *     splitChunks.minSize = 0;
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    configureSplitChunks(callback: OptionsCallback<object & Record<string, any>>): Encore {
        webpackConfig?.configureSplitChunks(callback);

        return this;
    }

    /**
     * Configure the watchOptions and devServer.watchOptions configuration.
     *
     * https://webpack.js.org/configuration/watch/
     * https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
     *
     * ```
     * Encore.configureWatchOptions(function(watchOptions) {
     *     // change the configuration
     *     watchOptions.poll = 250; // useful when running inside a Virtual Machine
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    configureWatchOptions(callback: OptionsCallback<Exclude<webpack.Configuration['watchOptions'], undefined>>): Encore {
        webpackConfig?.configureWatchOptions(callback);

        return this;
    }

    /**
     * Configure the devServer configuration.
     *
     * https://webpack.js.org/configuration/dev-server
     *
     * ```
     * Encore.configureDevServerOptions(function(options) {
     *     // change the configuration
     *     options.server = {
     *         type: 'https',
     *         options: {
     *             key: '<your SSL cert key content or path>',
     *             cert: '<your SSL cert content or path>',
     *         }
     *     };
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    configureDevServerOptions(callback: OptionsCallback<DevServerOptions>): Encore {
        webpackConfig?.configureDevServerOptions(callback);

        return this;
    }

    /**
     * Automatically make some variables available everywhere!
     *
     * Usage:
     *
     * ```
     * webpackConfig?.autoProvideVariables({
     *     $: 'jquery',
     *     jQuery: 'jquery'
     * });
     * ```
     *
     *  Then, whenever $ or jQuery are found in any
     *  modules, webpack will automatically require
     *  the "jquery" module so that the variable is available.
     *
     *  This is useful for older packages, that might
     *  expect jQuery (or something else) to be a global variable.
     *
     * @param variables -
     * @returns
     */
    autoProvideVariables(variables: Record<string, string | string[]>): Encore {
        webpackConfig?.autoProvideVariables(variables);

        return this;
    }

    /**
     * Makes jQuery available everywhere. Equivalent to
     *
     * ```
     * webpackConfig?.autoProvideVariables({
     *     $: 'jquery',
     *     jQuery: 'jquery',
     *     'window.jQuery': 'jquery'
     * });
     * ```
     *
     * @returns
     */
    autoProvidejQuery(): Encore {
        webpackConfig?.autoProvidejQuery();

        return this;
    }

    /**
     * Enables the postcss-loader
     *
     * Once enabled, you must have a postcss.config.js config file.
     *
     * https://github.com/postcss/postcss-loader
     *
     * ```
     * Encore.enablePostCssLoader();
     * ```
     *
     * Or pass options to the loader
     *
     * ```
     * Encore.enablePostCssLoader(function(options) {
     *     // https://github.com/postcss/postcss-loader#options
     *     // options.config = {...}
     * })
     * ```
     *
     * @param postCssLoaderOptionsCallback -
     * @returns
     */
    enablePostCssLoader(postCssLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enablePostCssLoader(postCssLoaderOptionsCallback);

        return this;
    }

    /**
     * Call this if you plan on loading SASS files.
     *
     * ```
     * Encore.enableSassLoader();
     * ```
     *
     * Or pass options to node-sass
     *
     * ```
     * Encore.enableSassLoader(function(options) {
     *     // https://github.com/sass/node-sass#options
     *     // options.includePaths = [...]
     * }, {
     *     // set optional Encore-specific options
     *     // resolveUrlLoader: true
     * });
     * ```
     * @param sassLoaderOptionsCallback -
     * @param encoreOptions -
     * @returns
     */
    enableSassLoader(
        sassLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { },
        encoreOptions: SassLoaderEncoreOptions = {},
    ): Encore {
        webpackConfig?.enableSassLoader(sassLoaderOptionsCallback, encoreOptions);

        return this;
    }

    /**
     * Call this if you plan on loading less files.
     *
     * ```
     * Encore.enableLessLoader();
     * ```
     *
     * Or pass options to the loader
     *
     * ```
     * Encore.enableLessLoader(function(options) {
     *     // https://github.com/webpack-contrib/less-loader#examples
     *     // http://lesscss.org/usage/#command-line-usage-options
     *     // options.relativeUrls = false;
     * });
     * ```
     *
     * @param lessLoaderOptionsCallback -
     * @returns
     */
    enableLessLoader(lessLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enableLessLoader(lessLoaderOptionsCallback);

        return this;
    }

    /**
     * Call this if you plan on loading stylus files.
     *
     * ```
     * Encore.enableStylusLoader();
     * ```
     *
     * Or pass options to the loader
     *
     * ```
     * Encore.enableStylusLoader(function(options) {
     *     // https://github.com/shama/stylus-loader
     *     // options.import = ['~library/index.styl'];
     * });
     * ```
     *
     * @param stylusLoaderOptionsCallback -
     * @returns
     */
    enableStylusLoader(stylusLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enableStylusLoader(stylusLoaderOptionsCallback);

        return this;
    }

    /**
     * Configure babel, without needing a .babelrc file.
     *
     * https://babeljs.io/docs/usage/babelrc/
     *
     * ```
     * Encore.configureBabel(function(babelConfig) {
     *     // change the babelConfig
     *     // if you use an external Babel configuration
     *     // this callback will NOT be used. In this case
     *     // you can pass null as the first parameter to
     *     // still be able to use some of the options below
     *     // without a warning.
     * }, {
     *     // set optional Encore-specific options, for instance:
     *
     *     // change the rule that determines which files
     *     // won't be processed by Babel
     *     exclude: /bower_components/
     *
     *     // ...or keep the default rule but only allow
     *     // *some* Node modules to be processed by Babel
     *     includeNodeModules: ['foundation-sites']
     *
     *     // automatically import polyfills where they
     *     // are needed
     *     useBuiltIns: 'usage'
     *
     *     // if you set useBuiltIns you also have to add
     *     // core-js to your project using Yarn or npm and
     *     // inform Babel of the version it will use.
     *     corejs: 3
     * });
     * ```
     * @param callback -
     * @param encoreOptions -
     * @returns
     */
    configureBabel(
        callback: OptionsCallback<BabelConfiguration> | null,
        encoreOptions: BabelOptions = {}): Encore {
        webpackConfig?.configureBabel(callback, encoreOptions);

        return this;
    }

    /**
     * Configure \@babel/preset-env
     *
     * https://babeljs.io/docs/en/babel-preset-env
     *
     * ```
     * Encore.configureBabelPresetEnv(function(options) {
     *     // change the @babel/preset-env config
     *     // if you use an external Babel configuration
     *     // this callback will NOT be used
     *     // options.corejs = 3;
     *     // options.useBuiltIns = 'usage';
     *     // ...
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    configureBabelPresetEnv(callback: OptionsCallback<BabelPresetEnvOptions>): Encore {
        webpackConfig?.configureBabelPresetEnv(callback);

        return this;
    }

    /**
     * Configure the css-loader.
     *
     * https://github.com/webpack-contrib/css-loader#options
     *
     * ```
     * Encore.configureCssLoader(function(config) {
     *     // change the config
     *     // config.minimize = true;
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    configureCssLoader(callback: OptionsCallback<CssLoaderOptions>): Encore {
        webpackConfig?.configureCssLoader(callback);

        return this;
    }

    /**
     * If enabled, the Stimulus bridge is used to load Stimulus controllers from PHP packages.
     *
     * @param controllerJsonPath - Path to the controllers.json file.
     * @returns
     */
    enableStimulusBridge(controllerJsonPath: string): Encore {
        webpackConfig?.enableStimulusBridge(controllerJsonPath);

        return this;
    }

    /**
     * Enables & configures persistent build caching.
     *
     * https://webpack.js.org/blog/2020-10-10-webpack-5-release/#persistent-caching
     *
     * ```
     * Encore.enableBuildCache({
     *     // object of "buildDependencies"
     *     // https://webpack.js.org/configuration/other-options/#cachebuilddependencies
     *     // __filename means that changes to webpack.config.js should invalidate the cache
     *     config: [__filename],
     * });
     *
     * // also configure other options the Webpack "cache" key
     * Encore.enableBuildCache({ config: [__filename] }, (cache) => {
     *     cache.version: `${process.env.GIT_REV}`;
     *
     *     cache.name: `${env.target}`
     * });
     * ```
     *
     * @param buildDependencies -
     * @param cacheCallback -
     * @returns
     */
    enableBuildCache(
        buildDependencies: Record<string, string[]>,
        cacheCallback: OptionsCallback<webpack.FileCacheOptions> = (_cache) => { },
    ): Encore {
        webpackConfig?.enableBuildCache(buildDependencies, cacheCallback);

        return this;
    }

    /**
     * Configure the mini-css-extract-plugin.
     *
     * https://github.com/webpack-contrib/mini-css-extract-plugin#configuration
     *
     * ```
     * Encore.configureMiniCssExtractPlugin(
     *     function(loaderConfig) {
     *         // change the loader's config
     *         // loaderConfig.reloadAll = true;
     *     },
     *     function(pluginConfig) {
     *         // change the plugin's config
     *         // pluginConfig.chunkFilename = '[id].css';
     *     }
     * );
     * ```
     *
     * @param loaderOptionsCallback -
     * @param pluginOptionsCallback -
     * @returns
     */
    configureMiniCssExtractPlugin(loaderOptionsCallback: OptionsCallback<import('mini-css-extract-plugin').LoaderOptions>, pluginOptionsCallback: OptionsCallback<import('mini-css-extract-plugin').PluginOptions> = () => { }): Encore {
        webpackConfig?.configureMiniCssExtractPlugin(loaderOptionsCallback, pluginOptionsCallback);

        return this;
    }

    /**
     * If enabled, the react preset is added to Babel.
     *
     * https://babeljs.io/docs/plugins/preset-react/
     *
     * You can configure the preset by passing a callback:
     * ```
     * Encore.enableReactPreset(function(options) {
     *     // https://babeljs.io/docs/babel-preset-react/#options
     *     options.development = !Encore.isProduction();
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    enableReactPreset(callback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enableReactPreset(callback);

        return this;
    }

    /**
     * If enabled, a Preact preset will be applied to
     * the generated Webpack and Babel configuration.
     *
     * ```
     * Encore.enablePreactPreset()
     * ```
     *
     * If you wish to also use preact-compat (https://github.com/developit/preact-compat)
     * you can enable it by setting the "preactCompat" option to true:
     *
     * ```
     * Encore.enablePreactPreset({ preactCompat: true })
     * ```
     *
     * @param options -
     * @returns
     */
    enablePreactPreset(options: PreactPresetEncoreOptions = {}): Encore {
        webpackConfig?.enablePreactPreset(options);

        return this;
    }

    /**
     * Call this to process TypeScript files through ts-loader.
     *
     * ```
     * Encore.enableTypeScriptLoader()
     * ```
     *
     * Or see Encore.enableBabelTypeScriptPreset() for a faster
     * method of processing TypeScript files.
     *
     * Or, configure the ts-loader options:
     *
     * ```
     * Encore.enableTypeScriptLoader(function(tsConfig) {
     *     // https://github.com/TypeStrong/ts-loader/blob/master/README.md#loader-options
     *     // tsConfig.silent = false;
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    enableTypeScriptLoader(callback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enableTypeScriptLoader(callback);

        return this;
    }

    /**
     * Call this to enable forked type checking for TypeScript loader
     * https://github.com/TypeStrong/ts-loader/blob/v2.3.0/README.md#faster-builds
     *
     * This is a build optimization API to reduce build times.
     *
     * @param forkedTypeScriptTypesCheckOptionsCallback -
     * @returns
     */
    enableForkedTypeScriptTypesChecking(forkedTypeScriptTypesCheckOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enableForkedTypeScriptTypesChecking(
            forkedTypeScriptTypesCheckOptionsCallback,
        );

        return this;
    }

    /**
     * If enabled, a TypeScript preset will be applied to
     * the generated Webpack and Babel configuration.
     *
     * ```
     * Encore.enableBabelTypeScriptPreset()
     * ```
     *
     * This method lets Babel handle your TypeScript code
     * and cannot be used with `Encore.enableTypeScriptLoader()`
     * or `Encore.enableForkedTypeScriptTypesChecking()`.
     *
     * Since all types are removed by Babel,
     * you must run `tsc --noEmit` yourself for type checking.
     *
     * The Babel TypeScript preset can be configured,
     * see https://babeljs.io/docs/en/babel-preset-typescript#options
     * for available options.
     *
     * For example:
     * ```
     * Encore.enableBabelTypeScriptPreset({
     *     isTSX: true
     * })
     * ```
     *
     * @param options -
     * @returns
     */
    enableBabelTypeScriptPreset(options: object = {}): Encore {
        webpackConfig?.enableBabelTypeScriptPreset(options);

        return this;
    }

    /**
     * If enabled, the Vue.js loader is enabled.
     *
     * https://github.com/vuejs/vue-loader
     *
     * ```
     * Encore.enableVueLoader();
     *
     * // or configure the vue-loader options
     * // https://vue-loader.vuejs.org/en/configurations/advanced.html
     * Encore.enableVueLoader(function(options) {
     *     options.preLoaders = { ... }
     * });
     * ```
     *
     * ```
     * // or configure Encore-specific options
     * Encore.enableVueLoader(() => {}, {
     *     // set optional Encore-specific options, for instance:
     *
     *     // set to false to *only* include the smaller "runtime"
     *     // build, which can't compile templates at runtime, but is
     *     // CSP compliant/
     *     // set explicitly to true to silence the recommendation
     *     runtimeCompilerBuild: false
     *
     *     // use version 2 or 3 to force your Vue version
     *     // otherwise, Encore will detect it automatically
     *     version: 2
     *
     *     // enable JSX usage in Vue components
     *     // https://vuejs.org/v2/guide/render-function.html#JSX
     *     useJsx: true
     * })
     * ```
     *
     * @param vueLoaderOptionsCallback -
     * @param encoreOptions -
     * @returns
     */
    enableVueLoader(
        vueLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { },
        encoreOptions: VueLoaderEncoreOptions = {},
    ): Encore {
        webpackConfig?.enableVueLoader(vueLoaderOptionsCallback, encoreOptions);

        return this;
    }

    /**
     * If enabled, display build notifications using
     * webpack-notifier.
     *
     * https://github.com/Turbo87/webpack-notifier
     *
     * ```
     * Encore.enableBuildNotifications();
     *
     * // or configure the webpack-notifier options
     * // https://github.com/Turbo87/webpack-notifier#configuration
     * Encore.enableBuildNotifications(true, function(options) {
     *     options.title = 'Webpack build';
     * });
     * ```
     *
     * @param enabled -
     * @param notifierPluginOptionsCallback -
     */
    enableBuildNotifications(
        enabled: boolean = true,
        notifierPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { },
    ): Encore {
        webpackConfig?.enableBuildNotifications(enabled, notifierPluginOptionsCallback);

        return this;
    }

    /**
     * Call this if you plan on loading Handlebars files.
     *
     * ```
     * Encore.enableHandlebarsLoader();
     * ```
     *
     * Or pass options to the loader
     *
     * ```
     * Encore.enableHandlebarsLoader(function(options) {
     *     // https://github.com/pcardune/handlebars-loader
     *     // options.debug = true;
     * });
     * ```
     *
     * @param callback -
     */
    enableHandlebarsLoader(callback: OptionsCallback<object & Record<string, any>> = () => { }): Encore {
        webpackConfig?.enableHandlebarsLoader(callback);

        return this;
    }

    /**
     * Call this if you don't want imported CSS to be extracted
     * into a .css file. All your styles will then be injected
     * into the page by your JS code.
     *
     * This can be useful when using the dev-server with hot
     * module reload (so that CSS can benefit from HMR):
     *
     * ```
     * // disable CSS only when using the dev-server
     * Encore.disableCssExtraction(Encore.isDevServer())
     * ```
     *
     * Internally, this disables the mini-css-extract-plugin
     * and uses the style-loader instead.
     *
     * @param disabled -
     * @returns
     */
    disableCssExtraction(disabled: boolean = true): Encore {
        webpackConfig?.disableCssExtraction(disabled);

        return this;
    }

    /**
     * Configure the style-loader.
     * The style-loader is used only if you also call Encore. disableCssExtraction().
     *
     * https://github.com/webpack-contrib/style-loader#options
     *
     * ```
     * Encore.configureStyleLoader(function(config) {
     *     // change the config
     *     // config.injectType = 'singletonStyleTag';
     * });
     * ```
     *
     * @param callback -
     * @returns
     */
    configureStyleLoader(callback: OptionsCallback<object & Record<string, any>>): Encore {
        webpackConfig?.configureStyleLoader(callback);

        return this;
    }

    /**
     * Call this to change how the name of each output
     * file is generated.
     *
     * ```
     * Encore.configureFilenames({
     *     js: '[name].[contenthash].js',
     *     css: '[name].[contenthash].css',
     *     assets: 'assets/[name].[hash:8][ext]',
     * });
     * ```
     *
     * It's safe to omit a key (e.g. css): the default naming strategy
     * will be used for any file types not passed.
     *
     * If you are using Encore.enableVersioning()
     * make sure that your "js" and "css" filenames contain
     * "[contenthash]".
     *
     * The "assets" key is used for the output.assetModuleFilename option,
     * which is overridden for both fonts and images. See configureImageRule()
     * and configureFontRule() to control those filenames.
     *
     * @param filenames -
     * @returns
     */
    configureFilenames(filenames: FilenamesOptions): Encore {
        webpackConfig?.configureFilenames(filenames);

        return this;
    }

    /**
     * Configure how images are loaded/processed under module.rules.
     *
     * https://webpack.js.org/guides/asset-modules/
     *
     * The most important things can be controlled by passing
     * an options object to the first argument:
     *
     * ```
     * Encore.configureImageRule({
     *     // common values: asset, asset/resource, asset/inline
     *     // Using "asset" will allow smaller images to be "inlined"
     *     // instead of copied.
     *     // javascript/auto can be used to disable asset images (see next example)
     *     type: 'asset/resource',
     *
     *     // applicable when for "type: asset": files smaller than this
     *     // size will be "inlined" into CSS, larger files will be extracted
     *     // into independent files
     *     maxSize: 4 * 1024, // 4 kb
     *
     *     // control the output filename of images
     *     filename: 'images/[name].[hash:8][ext]',
     *
     *     // you can also fully disable the image rule if you want
     *     // to control things yourself
     *     enabled: true,
     * });
     * ```
     *
     * If you need more control, you can also pass a callback to the
     * 2nd argument. This will be passed the specific Rule object,
     * which you can modify:
     *
     * https://webpack.js.org/configuration/module/#rule
     *
     * ```
     * Encore.configureImageRule({}, function(rule) {
     *     // if you set "type: 'javascript/auto'" in the first argument,
     *     // then you can now specify a loader manually
     *     // rule.loader = 'file-loader';
     *     // rule.options = { filename: 'images/[name].[hash:8][ext]' }
     * });
     * ```
     *
     * @param options -
     * @param ruleCallback -
     * @returns
     */
    configureImageRule(
        options: ImageRuleOptions = {},
        ruleCallback: OptionsCallback<webpack.RuleSetRule> = (_rule) => { },
    ): Encore {
        webpackConfig?.configureImageRule(options, ruleCallback);

        return this;
    }

    /**
     * Configure how fonts are processed/loaded under module.rules.
     *
     * https://webpack.js.org/guides/asset-modules/
     *
     * See configureImageRule() for more details.
     *
     * @param options -
     * @param ruleCallback -
     * @returns
     */
    configureFontRule(
        options: FontRuleOptions = {},
        ruleCallback: OptionsCallback<webpack.RuleSetRule> = (_rule) => { }): Encore {
        webpackConfig?.configureFontRule(options, ruleCallback);

        return this;
    }

    /**
     * Configure Webpack loaders rules (`module.rules`).
     * This is a low-level function, be careful when using it.
     *
     * https://webpack.js.org/concepts/loaders/#configuration
     *
     * ```
     * Encore
     *     .enableVueLoader()
     *     .configureLoaderRule('vue', (loaderRule) => {
     *         // some custom config for vue-loader
     *     });
     * ```
     *
     * @param name -
     * @param callback -
     * @returns
     */
    configureLoaderRule(name: string, callback: OptionsCallback<webpack.RuleSetRule>): Encore {
        webpackConfig?.configureLoaderRule(name, callback);

        return this;
    }

    /**
     * If enabled, the output directory is emptied between each build (to remove old files).
     *
     * A list of available options can be found at https://webpack.js.org/configuration/output/#outputclean
     *
     * For example:
     *
     * ```
     * Encore.cleanupOutputBeforeBuild((options) => {
     *     options.dry = true;
     * })
     * ```
     *
     * @param cleanOptionsCallback -
     * @returns
     */
    cleanupOutputBeforeBuild(cleanOptionsCallback: OptionsCallback<Exclude<ConstructorParameters<typeof webpack.CleanPlugin>[0], undefined>> = () => { }): Encore {
        webpackConfig?.cleanupOutputBeforeBuild(cleanOptionsCallback);

        return this;
    }

    /**
     * If enabled, add integrity hashes to the entrypoints.json
     * file for all the files it references.
     *
     * These hashes can then be used, for instance, in the "integrity"
     * attributes of <script> and <style> tags to enable subresource-
     * integrity checks in the browser.
     *
     * https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
     *
     * For example:
     *
     * ```
     * Encore.enableIntegrityHashes(
     *     Encore.isProduction(),
     *     'sha384'
     * );
     * ```
     *
     * Or with multiple algorithms:
     *
     * ```
     * Encore.enableIntegrityHashes(
     *     Encore.isProduction(),
     *     ['sha256', 'sha384', 'sha512']
     * );
     * ```
     *
     * @param enabled -
     * @param algorithms -
     * @returns
     */
    enableIntegrityHashes(enabled: boolean = true, algorithms: string | string[] = ['sha384']): Encore {
        webpackConfig?.enableIntegrityHashes(enabled, algorithms);

        return this;
    }

    /**
     * Is this currently a "production" build?
     *
     * @returns
     */
    isProduction(): boolean {
        return webpackConfig?.isProduction() ?? false;
    }

    /**
     * Is this currently a "dev" build?
     *
     * @returns
     */
    isDev(): boolean {
        return webpackConfig?.isDev() ?? false;
    }

    /**
     * Is this currently a "dev-server" build?
     *
     * @returns
     */
    isDevServer(): boolean {
        return webpackConfig?.isDevServer() ?? false;
    }

    /**
     * Use to conditionally configure or enable features only when the first parameter results to "true".
     *
     * ```
     * Encore
     *     // passing a callback
     *     .when((Encore) => Encore.isProduction(), (Encore) => Encore.enableVersioning())
     *     // passing a boolean
     *     .when(process.argv.includes('--analyze'), (Encore) => Encore.addPlugin(new BundleAnalyzerPlugin()))
     * ```
     *
     * @param condition -
     * @param callback -
     */
    when(condition: ((arg0: Encore) => boolean) | boolean, callback: (arg0: Encore) => void): Encore {
        if ((typeof condition === 'function' && condition(this)) || (typeof condition === 'boolean' && condition)) {
            callback(this);
        }

        return this;
    }

    /**
     * Use this at the bottom of your webpack.config.js file:
     *
     * ```
     * module.exports = Encore.getWebpackConfig();
     * ```
     *
     * @returns
     */
    getWebpackConfig(): webpack.Configuration {
        if (!webpackConfig) {
            throw new Error('Could not get webpack config. The runtime config has not been initialized.');
        }

        validator(webpackConfig);

        return configGenerator(webpackConfig);
    }

    /**
     * Resets the Encore state to allow building a new config.
     *
     * getWebpackConfig should be used before resetting to build
     * a config for the existing state.
     */
    reset(): void {
        webpackConfig = runtimeConfig ? new WebpackConfig(runtimeConfig) : null;
    }

    /**
     * Initialize the runtime environment.
     *
     * This can be used to configure the Encore runtime if you're
     * using Encore without executing the "./node_module/.bin/encore"
     * utility (e.g. with karma-webpack).
     *
     * ```
     * Encore.configureRuntimeEnvironment(
     *     // Environment to use (dev, dev-server, production)
     *     'dev-server',
     *
     *     // Same options you would use with the
     *     // CLI utility with their name in
     *     // camelCase.
     *     {
     *         https: true,
     *         keepPublicPath: true
     *     }
     * )
     * ```
     *
     * Be aware that using this method will also reset the current
     * webpack configuration.
     *
     * @param environment -
     * @param options -
     */
    configureRuntimeEnvironment(environment: string, options: object = {}): Encore {
        runtimeConfig = parseRuntime(
            Object.assign(
                {},
                yargsParser([environment]),
                options,
            ),
            process.cwd(),
        );

        webpackConfig = new WebpackConfig(runtimeConfig);

        return this;
    }

    /**
     * Check if Encore was either called through
     * the CLI utility or after being manually initialized
     * using Encore.configureRuntimeEnvironment.
     */
    isRuntimeEnvironmentConfigured(): boolean {
        return runtimeConfig !== null;
    }

    /**
     * Clear the runtime environment.
     *
     * Be aware that using this method will also reset the
     * current webpack configuration.
     */
    clearRuntimeEnvironment(): void {
        runtimeConfig = null;
        webpackConfig = null;
    }

    /**
     * If enabled, the SvelteJs loader is enabled.
     *
     * https://github.com/sveltejs/svelte-loader
     */
    enableSvelte(): Encore {
        webpackConfig?.enableSvelte();

        return this;
    }
}
