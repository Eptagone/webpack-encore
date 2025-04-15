/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type webpack from 'webpack';
import type RuntimeConfig from './config/RuntimeConfig.ts';
import type { OptionsCallback } from './utils/apply-options-callback.ts';

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { LoaderContext } from 'webpack';
import type { AssetRuleOptions, DevServerOptions } from './config-generator.ts';
import { calculateDevServerUrl } from './config/path-util.ts';
import * as featuresHelper from './features.ts';
import type { BabelConfiguration, BabelOptionsBase, BabelPresetEnvOptions } from './loaders/babel.ts';
import * as logger from './logger.ts';
import regexpEscaper from './utils/regexp-escaper.ts';

export interface BabelOptions extends BabelOptionsBase {
    /**
     * A Webpack Condition passed to the JS/JSX rule that
     * determines which files and folders should not be
     * processed by Babel (https://webpack.js.org/configuration/module/#condition).
     * Can be used even if you have an external Babel configuration
     * (a babel.config.json file for instance)
     * Warning: .babelrc config files don't apply to node_modules. Use
     * babel.config.json instead to apply the same config to modules if
     * they are not excluded anymore.
     * Cannot be used if the "includeNodeModules" option is
     * also set.
     * @defaultValue /(node_modules|bower_components)/
     */
    exclude?: webpack.RuleSetCondition;

    /**
     * If set that option will include the given Node modules to
     * the files that are processed by Babel.
     * Can be used even if you have an external Babel configuration
     * (a babel.config.json file for instance).
     * Warning: .babelrc config files don't apply to node_modules. Use
     * babel.config.json instead to apply the same config to these modules.
     * Cannot be used if the "exclude" option is also set
     */
    includeNodeModules?: string[];
}

export interface CopyFilesOptions {
    /**
     * The path of the source directory (mandatory)
     */
    from: string;
    /**
     * A regular expression (or a string containing one) that the filenames must match in order to be copied. Default: all files
     */
    pattern?: RegExp | string;

    /**
     * Where the files must be copied to. You can add all the placeholders supported by the file-loader.
     * @see https://github.com/webpack-contrib/file-loader#placeholders
     * @defaultValue "[path][name].[ext]"
     */
    to?: string | null;

    /**
     * Whether or not the copy should include subdirectories.
     * @defaultValue true
     */
    includeSubdirectories?: boolean;

    /**
     * The context to use as a root path when copying files. Default: path of the source directory.
     */
    context?: string;
};

export interface FilenamesOptions {
    js?: string;
    css?: string;
    images?: string;
    fonts?: string;
    assets?: string;
}

export interface PreactPresetEncoreOptions extends Record<string, any> {
    preactCompat?: boolean;
}

export interface SassLoaderEncoreOptions extends Record<string, any> {
    /**
     * Whether or not to use the resolve-url-loader.
     * Setting to false can increase performance in some
     * cases, especially when using bootstrap_sass. But,
     * when disabled, all url()'s are resolved relative
     * to the original entry file... not whatever file
     * the url() appears in.
     * @defaultValue true
     */
    resolveUrlLoader?: boolean;

    /**
     * Options parameters for resolve-url-loader
     * @see https://www.npmjs.com/package/resolve-url-loader#options
     * @defaultValue \{\}
     */
    resolveUrlLoaderOptions?: object;
}

export interface VueLoaderEncoreOptions extends Record<string, any> {
    /**
     * Configure Babel to use the preset "\@vue/babel-preset-jsx",
     * in order to enable JSX usage in Vue components.
     * @defaultValue false
     */
    useJsx?: boolean;

    version?: number | string | null;
    runtimeCompilerBuild?: boolean | null;
}

/**
 * @see https://webpack.js.org/loaders/css-loader/#options
 */
export interface CssLoaderOptions {
    /**
     * Allow to enable/disables handling the CSS functions url and image-set.
     * If set to false, css-loader will not parse any paths specified in url or image-set.
     * A function can also be passed to control this behavior dynamically based on the path to the asset.
     * Starting with version 4.0.0, absolute paths are parsed based on the server root.
     * @see https://webpack.js.org/loaders/css-loader/#url
     * @defaultValue true
     */
    url?: boolean
    | {
        filter: (url: string, resourcePath: string) => boolean;
    };

    /**
     * Allows to enables/disables \@import at-rules handling.
     * Control \@import resolving.
     * Absolute urls in \@import will be moved in runtime code.
     * @see https://webpack.js.org/loaders/css-loader/#import
     * @defaultValue true
     */
    import?: boolean
    | {
        filter: (
            url: string,
            media: string,
            resourcePath: string,
            supports?: string,
            layer?: string,
        ) => boolean;
    };

    /**
     * Allows to enable/disable CSS Modules or ICSS and setup configuration:
     * undefined - enable CSS modules for all files matching /\.module\.\\w+$/i.test(filename) and /\.icss\.\\w+$/i.test(filename) regexp
     * true - enable CSS modules for all files
     * false - disables CSS Modules for all files
     * string - disables CSS Modules for all files and set the mode option, more information you can read her
     * object - enable CSS modules for all files, if modules.auto option is not specified, otherwise the modules.auto option will determine whether if it is CSS modules or not, more information you can read here
     * @see https://webpack.js.org/loaders/css-loader/#modules
     * @defaultValue undefined
     */
    modules?: boolean
    | 'local'
    | 'global'
    | 'pure'
    | 'icss'
    | Partial<{
        auto: boolean | RegExp | ((resourcePath: string) => boolean);
        mode:
        | 'local'
        | 'global'
        | 'pure'
        | 'icss'
        | ((resourcePath: string) => 'local' | 'global' | 'pure' | 'icss');
        localIdentName: string;
        localIdentContext: string;
        localIdentHashSalt: string;
        localIdentHashFunction: string;
        localIdentHashDigest: string;
        localIdentRegExp: string | RegExp;
        getLocalIdent: (
            context: LoaderContext<unknown>,
            localIdentName: string,
            localName: string,
        ) => string;
        namedExport: boolean;
        exportGlobals: boolean;
        exportLocalsConvention:
        | 'as-is'
        | 'camel-case'
        | 'camel-case-only'
        | 'dashes'
        | 'dashes-only'
        | ((name: string) => string);
        exportOnlyLocals: boolean;
        getJSON: ({
            resourcePath,
            imports,
            exports,
            replacements,
        }: {
            resourcePath: string;
            imports: object[];
            exports: object[];
            replacements: object[];
        }) => Promise<void> | void;
    }>;

    /**
     * Allows to enables/disables or setups number of loaders applied before CSS loader for \@import at-rules, CSS modules and ICSS imports, i.e. \@import/composes/\@value value from './values.css'/etc.
     * The option importLoaders allows you to configure how many loaders before css-loader should be applied to \@imported resources and CSS modules/ICSS imports.
     * @see https://webpack.js.org/loaders/css-loader/#importloaders
     * @defaultValue 0
     */
    importLoaders?: number;

    /**
     * By default generation of source maps depends on the devtool option. All values enable source map generation except eval and false value.
     * The default value depends on the compiler.devtool value.
     * @see https://webpack.js.org/loaders/css-loader/#sourcemap
     */
    sourceMap?: boolean;

    /**
     * By default, css-loader generates JS modules that use the ES modules syntax. There are some cases in which using ES modules is beneficial, like in the case of module concatenation and tree shaking.
     * @see https://webpack.js.org/loaders/css-loader/#sourcemap
     * @defaultValue true
     */
    esModule?: boolean;

    /**
     * Allows exporting styles as array with modules, string or constructable stylesheet (i.e. CSSStyleSheet). Default value is 'array', i.e. loader exports array of modules with specific API which is used in style-loader or other.
     * @see https://webpack.js.org/loaders/css-loader/#exporttype
     * @defaultValue 'array'
     */
    exportType?: 'array' | 'string' | 'css-style-sheet';
}

export type ImageRuleOptions = AssetRuleOptions & Record<string, any>;
export type FontRuleOptions = AssetRuleOptions & Record<string, any>;

interface ValidatedRuntimeConfig extends Omit<RuntimeConfig, 'context' | 'babelRcFileExists'> {
    context: string;
    babelRcFileExists: boolean;
};

function validateRuntimeConfig(runtimeConfig: RuntimeConfig | ValidatedRuntimeConfig | null): asserts runtimeConfig is ValidatedRuntimeConfig {
    // if you're using the encore executable, these things should never happen
    if (null === runtimeConfig) {
        throw new Error('RuntimeConfig must be initialized');
    }

    if (null === runtimeConfig.context) {
        throw new Error('RuntimeConfig.context must be set.');
    }

    if (null === runtimeConfig.babelRcFileExists) {
        throw new Error('RuntimeConfig.babelRcFileExists must be set.');
    }
}

class WebpackConfig {
    public readonly runtimeConfig: ValidatedRuntimeConfig;
    public readonly entries: Map<string, string | string[]> = new Map();
    public readonly styleEntries: Map<string, string | string[]> = new Map();
    public readonly plugins: Array<{
        plugin: webpack.WebpackPluginInstance;
        priority: number;
    }> = [];

    public readonly loaders: webpack.RuleSetRule[] = [];

    // Global settings
    public outputPath: string | null = null;
    public publicPath: string | null = null;
    public manifestKeyPrefix: string | null = null;
    public cacheGroups: Record<string, any> = {};
    public providedVariables: Record<string, string | string[]> = {};
    public configuredFilenames: FilenamesOptions = {};
    public aliases: Record<string, string> = {};
    public externals: webpack.Externals[] = [];
    public integrityAlgorithms: string[] = [];
    public shouldUseSingleRuntimeChunk: boolean | null = null;
    public shouldSplitEntryChunks: boolean = false;

    // Features/Loaders flags
    public useVersioning: boolean = false;
    public useSourceMaps: boolean = false;
    public cleanupOutput: boolean = false;
    public usePersistentCache: boolean = false;
    public extractCss: boolean = true;
    public imageRuleOptions: ImageRuleOptions = {
        type: 'asset/resource',
        maxSize: null,
        filename: 'images/[name].[hash:8][ext]',
        enabled: true,
    };

    public fontRuleOptions: FontRuleOptions = {
        type: 'asset/resource',
        maxSize: null,
        filename: 'fonts/[name].[hash:8][ext]',
        enabled: true,
    };

    public usePostCssLoader: boolean = false;
    public useLessLoader: boolean = false;
    public useStylusLoader: boolean = false;
    public useSassLoader: boolean = false;
    public useStimulusBridge: boolean = false;
    public useReact: boolean = false;
    public usePreact: boolean = false;
    public useVueLoader: boolean = false;
    public useTypeScriptLoader: boolean = false;
    public useForkedTypeScriptTypeChecking: boolean = false;
    public useBabelTypeScriptPreset: boolean = false;
    public useWebpackNotifier: boolean = false;
    public useHandlebarsLoader: boolean = false;
    public useSvelte: boolean = false;

    // Features/Loaders options
    public copyFilesConfigs: CopyFilesOptions[] = [];
    public sassOptions: SassLoaderEncoreOptions = {
        resolveUrlLoader: true,
        resolveUrlLoaderOptions: {},
    };

    public preactOptions: PreactPresetEncoreOptions = {
        preactCompat: false,
    };

    public babelOptions: BabelOptions = {
        exclude: /(node_modules|bower_components)/,
        useBuiltIns: false,
        corejs: null,
    };

    public babelTypeScriptPresetOptions: object = {};
    public vueOptions: VueLoaderEncoreOptions = {
        useJsx: false,
        version: null,
        runtimeCompilerBuild: null,
    };

    public persistentCacheBuildDependencies: Record<string, string[]> = {};

    // Features/Loaders options callbacks
    public imageRuleCallback: OptionsCallback<webpack.RuleSetRule> = () => { };
    public fontRuleCallback: OptionsCallback<webpack.RuleSetRule> = () => { };
    public postCssLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public sassLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public lessLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public stylusLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public babelConfigurationCallback: OptionsCallback<BabelConfiguration> = () => { };
    public babelPresetEnvOptionsCallback: OptionsCallback<BabelPresetEnvOptions> = () => { };
    public babelReactPresetOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public cssLoaderConfigurationCallback: OptionsCallback<CssLoaderOptions> = () => { };
    public styleLoaderConfigurationCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public splitChunksConfigurationCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public watchOptionsConfigurationCallback: OptionsCallback<Exclude<webpack.Configuration['watchOptions'], undefined>> = () => { };
    public devServerOptionsConfigurationCallback: OptionsCallback<DevServerOptions> = () => { };
    public vueLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public tsConfigurationCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public handlebarsConfigurationCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public miniCssExtractLoaderConfigurationCallback: OptionsCallback<import('mini-css-extract-plugin').LoaderOptions> = () => { };
    public miniCssExtractPluginConfigurationCallback: OptionsCallback<import('mini-css-extract-plugin').PluginOptions> = () => { };
    public loaderConfigurationCallbacks: Record<string, OptionsCallback<webpack.RuleSetRule>> = {
        javascript: () => { },
        css: () => { },
        images: () => { },
        fonts: () => { },
        sass: () => { },
        less: () => { },
        stylus: () => { },
        vue: () => { },
        typescript: () => { },
        handlebars: () => { },
        svelte: () => { },
    };

    // Plugins callbacks
    public cleanOptionsCallback: OptionsCallback<Exclude<ConstructorParameters<typeof webpack.CleanPlugin>[0], undefined>> = () => { };
    public definePluginOptionsCallback: OptionsCallback<ConstructorParameters<typeof webpack.DefinePlugin>[0]> = () => { };
    public forkedTypeScriptTypesCheckOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public friendlyErrorsPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public manifestPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public terserPluginOptionsCallback: OptionsCallback<import('terser-webpack-plugin').BasePluginOptions & import('terser-webpack-plugin').DefinedDefaultMinimizerAndOptions<import('terser').MinifyOptions>> = () => { };
    public cssMinimizerPluginOptionsCallback: OptionsCallback<import('css-minimizer-webpack-plugin').BasePluginOptions & import('css-minimizer-webpack-plugin').DefinedDefaultMinimizerAndOptions<import('css-minimizer-webpack-plugin').CssNanoOptionsExtended>> = () => { };
    public notifierPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { };
    public persistentCacheCallback: OptionsCallback<webpack.FileCacheOptions> = () => { };

    constructor(runtimeConfig: RuntimeConfig) {
        validateRuntimeConfig(runtimeConfig);
        if (runtimeConfig.verbose) {
            logger.verbose();
        }
        this.runtimeConfig = runtimeConfig;
    }

    getContext(): string {
        return this.runtimeConfig.context;
    }

    doesBabelRcFileExist(): boolean {
        return this.runtimeConfig.babelRcFileExists;
    }

    setOutputPath(outputPath: string): void {
        if (!path.isAbsolute(outputPath)) {
            outputPath = path.resolve(this.getContext(), outputPath);
        }

        if (!fs.existsSync(outputPath)) {
            // If the parent of the output directory does not exist either
            // check if it is located under the context directory before
            // creating it and its parent.
            const parentPath = path.dirname(outputPath);
            if (!fs.existsSync(parentPath)) {
                const context = path.resolve(this.getContext());
                if (outputPath.indexOf(context) !== 0) {
                    throw new Error(`outputPath directory "${outputPath}" does not exist and is not located under the context directory "${context}". Please check the path you're passing to setOutputPath() or create this directory.`);
                }

                parentPath.split(path.sep).reduce((previousPath, directory) => {
                    const newPath = path.resolve(previousPath, directory);
                    if (!fs.existsSync(newPath)) {
                        fs.mkdirSync(newPath);
                    }
                    return newPath;
                }, path.sep);
            }

            fs.mkdirSync(outputPath);
        }

        this.outputPath = outputPath;
    }

    setPublicPath(publicPath: string): void {
        if (publicPath.includes('://') === false && publicPath.indexOf('/') !== 0) {
            // technically, not starting with "/" is legal, but not
            // what you want in most cases. Let's warn the user that
            // they might be making a mistake.
            logger.warning('The value passed to setPublicPath() should *usually* start with "/" or be a full URL (http://...). If you\'re not sure, then you should probably change your public path and make this message disappear.');
        }

        // guarantee a single trailing slash
        publicPath = publicPath.replace(/\/$/, '');
        publicPath = publicPath + '/';

        this.publicPath = publicPath;
    }

    setManifestKeyPrefix(manifestKeyPrefix: string): void {
        /*
         * Normally, we make sure that the manifest keys don't start
         * with an opening "/" ever... for consistency. If you need
         * to manually specify the manifest key (e.g. because you're
         * publicPath is absolute), it's easy to accidentally add
         * an opening slash (thereby changing your key prefix) without
         * intending to. Hence, the warning.
         */
        if (manifestKeyPrefix.indexOf('/') === 0) {
            logger.warning(`The value passed to setManifestKeyPrefix "${manifestKeyPrefix}" starts with "/". This is allowed, but since the key prefix does not normally start with a "/", you may have just changed the prefix accidentally.`);
        }

        // guarantee a single trailing slash, except for blank strings
        if (manifestKeyPrefix !== '') {
            manifestKeyPrefix = manifestKeyPrefix.replace(/\/$/, '');
            manifestKeyPrefix = manifestKeyPrefix + '/';
        }

        this.manifestKeyPrefix = manifestKeyPrefix;
    }

    configureDefinePlugin(definePluginOptionsCallback: OptionsCallback<ConstructorParameters<typeof webpack.DefinePlugin>[0]> = () => { }): void {
        if (typeof definePluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureDefinePlugin() must be a callback function');
        }

        this.definePluginOptionsCallback = definePluginOptionsCallback;
    }

    configureFriendlyErrorsPlugin(friendlyErrorsPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        if (typeof friendlyErrorsPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureFriendlyErrorsPlugin() must be a callback function');
        }

        this.friendlyErrorsPluginOptionsCallback = friendlyErrorsPluginOptionsCallback;
    }

    configureManifestPlugin(manifestPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        if (typeof manifestPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureManifestPlugin() must be a callback function');
        }

        this.manifestPluginOptionsCallback = manifestPluginOptionsCallback;
    }

    configureTerserPlugin(terserPluginOptionsCallback: OptionsCallback<import('terser-webpack-plugin').BasePluginOptions & import('terser-webpack-plugin').DefinedDefaultMinimizerAndOptions<import('terser').MinifyOptions>> = () => { }): void {
        if (typeof terserPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureTerserPlugin() must be a callback function');
        }

        this.terserPluginOptionsCallback = terserPluginOptionsCallback;
    }

    configureCssMinimizerPlugin(cssMinimizerPluginOptionsCallback: OptionsCallback<import('css-minimizer-webpack-plugin').BasePluginOptions & import('css-minimizer-webpack-plugin').DefinedDefaultMinimizerAndOptions<import('css-minimizer-webpack-plugin').CssNanoOptionsExtended>> = () => { }): void {
        if (typeof cssMinimizerPluginOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureCssMinimizerPlugin() must be a callback function');
        }

        this.cssMinimizerPluginOptionsCallback = cssMinimizerPluginOptionsCallback;
    }

    /**
     * Returns the value that should be used as the publicPath,
     * which can be overridden by enabling the webpackDevServer
     */
    getRealPublicPath(): string | null {
        if (!this.useDevServer()) {
            return this.publicPath;
        }

        if (this.runtimeConfig.devServerKeepPublicPath) {
            return this.publicPath;
        }

        if (this.publicPath?.includes('://')) {
            return this.publicPath;
        }

        const devServerUrl = calculateDevServerUrl(this.runtimeConfig);

        // if using dev-server, prefix the publicPath with the dev server URL
        return devServerUrl.replace(/\/$/, '') + this.publicPath;
    }

    addEntry(name: string, src: string | string[]): void {
        this.validateNameIsNewEntry(name);

        this.entries.set(name, src);
    }

    /**
     * Provide a has of entries at once, as an alternative to calling `addEntry` several times.
     */
    addEntries(entries: Record<string, string | string[]> = {}): void {
        if (typeof entries !== 'object') {
            throw new Error('Argument 1 to addEntries() must be an object.');
        }

        Object.entries(entries).forEach(entry => this.addEntry(entry[0], entry[1]));
    }

    addStyleEntry(name: string, src: string | string[]): void {
        this.validateNameIsNewEntry(name);

        this.styleEntries.set(name, src);
    }

    addPlugin(plugin: webpack.WebpackPluginInstance, priority = 0): void {
        if (typeof priority !== 'number') {
            throw new Error('Argument 2 to addPlugin() must be a number.');
        }

        this.plugins.push({
            plugin: plugin,
            priority: priority,
        });
    }

    addLoader(loader: webpack.RuleSetRule): void {
        this.loaders.push(loader);
    }

    addAliases(aliases: Record<string, string> = {}): void {
        if (typeof aliases !== 'object') {
            throw new Error('Argument 1 to addAliases() must be an object.');
        }

        Object.assign(this.aliases, aliases);
    }

    addExternals(externals: webpack.Externals = []): void {
        if (!Array.isArray(externals)) {
            externals = [externals];
        }

        this.externals = this.externals.concat(externals);
    }

    enableVersioning(enabled = true): void {
        this.useVersioning = enabled;
    }

    enableSourceMaps(enabled = true): void {
        this.useSourceMaps = enabled;
    }

    configureBabel(callback: OptionsCallback<BabelConfiguration> | null,
        options: BabelOptions = {}) {
        if (callback) {
            if (typeof callback !== 'function') {
                throw new Error('Argument 1 to configureBabel() must be a callback function or null.');
            }

            if (this.doesBabelRcFileExist()) {
                throw new Error('The "callback" argument of configureBabel() will not be used because your app already provides an external Babel configuration (e.g. a ".babelrc" or "babel.config.js" file or "babel" key in "package.json"). Use null as the first argument to remove this error.');
            }
        }

        this.babelConfigurationCallback = callback || (() => { });

        // Whitelist some options that can be used even if there
        // is an external Babel config. The other ones won't be
        // applied and a warning message will be displayed instead.
        const allowedOptionsWithExternalConfig = ['includeNodeModules', 'exclude'];

        for (const optionKey of Object.keys(options)) {
            if (this.doesBabelRcFileExist() && !allowedOptionsWithExternalConfig.includes(optionKey)) {
                logger.warning(`The "${optionKey}" option of configureBabel() will not be used because your app already provides an external Babel configuration (e.g. a ".babelrc" or "babelrc.config.js" file or "babel" key in "package.json").`);
                continue;
            }

            if (optionKey === 'includeNodeModules') {
                if (Object.keys(options).includes('exclude')) {
                    throw new Error('"includeNodeModules" and "exclude" options can\'t be used together when calling configureBabel().');
                }

                const value = options[optionKey];
                if (!Array.isArray(value)) {
                    throw new Error('Option "includeNodeModules" passed to configureBabel() must be an Array.');
                }

                this.babelOptions['exclude'] = (filePath) => {
                    // Don't exclude modules outside of node_modules/bower_components
                    if (!/(node_modules|bower_components)/.test(filePath)) {
                        return false;
                    }

                    // Don't exclude whitelisted Node modules
                    const whitelistedModules = value.map(
                        module => path.join('node_modules', module) + path.sep,
                    );

                    for (const modulePath of whitelistedModules) {
                        if (filePath.includes(modulePath)) {
                            return false;
                        }
                    }

                    // Exclude other modules
                    return true;
                };
            }
            else if (!(optionKey in this.babelOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to configureBabel(). Valid keys are ${[...Object.keys(this.babelOptions), 'includeNodeModules'].join(', ')}`);
            }
            else {
                this.babelOptions[optionKey] = options[optionKey];
            }
        }
    }

    configureBabelPresetEnv(callback: OptionsCallback<BabelPresetEnvOptions>): void {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureBabelPresetEnv() must be a callback function.');
        }

        if (this.doesBabelRcFileExist()) {
            throw new Error('The "callback" argument of configureBabelPresetEnv() will not be used because your app already provides an external Babel configuration (e.g. a ".babelrc" or "babel.config.js" file or "babel" key in "package.json").');
        }

        this.babelPresetEnvOptionsCallback = callback;
    }

    configureCssLoader(callback: OptionsCallback<CssLoaderOptions>): void {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureCssLoader() must be a callback function.');
        }

        this.cssLoaderConfigurationCallback = callback;
    }

    configureStyleLoader(callback: OptionsCallback<object & Record<string, any>>): void {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureStyleLoader() must be a callback function.');
        }

        this.styleLoaderConfigurationCallback = callback;
    }

    configureMiniCssExtractPlugin(
        loaderOptionsCallback: OptionsCallback<import('mini-css-extract-plugin').LoaderOptions>,
        pluginOptionsCallback: OptionsCallback<import('mini-css-extract-plugin').PluginOptions> = () => { }): void {
        if (typeof loaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to configureMiniCssExtractPluginLoader() must be a callback function.');
        }

        if (typeof pluginOptionsCallback !== 'function') {
            throw new Error('Argument 2 to configureMiniCssExtractPluginLoader() must be a callback function.');
        }

        this.miniCssExtractLoaderConfigurationCallback = loaderOptionsCallback;
        this.miniCssExtractPluginConfigurationCallback = pluginOptionsCallback;
    }

    enableSingleRuntimeChunk(): void {
        this.shouldUseSingleRuntimeChunk = true;
    }

    disableSingleRuntimeChunk(): void {
        this.shouldUseSingleRuntimeChunk = false;
    }

    splitEntryChunks(): void {
        this.shouldSplitEntryChunks = true;
    }

    configureSplitChunks(callback: OptionsCallback<object & Record<string, any>>): void {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureSplitChunks() must be a callback function.');
        }

        this.splitChunksConfigurationCallback = callback;
    }

    configureWatchOptions(callback: OptionsCallback<Exclude<webpack.Configuration['watchOptions'], undefined>>): void {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureWatchOptions() must be a callback function.');
        }

        this.watchOptionsConfigurationCallback = callback;
    }

    configureDevServerOptions(callback: OptionsCallback<DevServerOptions>): void {
        featuresHelper.ensurePackagesExistAndAreCorrectVersion('webpack-dev-server');

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to configureDevServerOptions() must be a callback function.');
        }

        this.devServerOptionsConfigurationCallback = callback;
    }

    addCacheGroup(name: string, options: Record<string, any>): void {
        if (typeof name !== 'string') {
            throw new Error('Argument 1 to addCacheGroup() must be a string.');
        }

        if (typeof options !== 'object') {
            throw new Error('Argument 2 to addCacheGroup() must be an object.');
        }

        if (!options['test'] && !options['node_modules']) {
            throw new Error('Either the "test" option or the "node_modules" option of addCacheGroup() must be set');
        }

        if (options['node_modules']) {
            if (!Array.isArray(options['node_modules'])) {
                throw new Error('The "node_modules" option of addCacheGroup() must be an array');
            }

            options.test = new RegExp(`[\\\\/]node_modules[\\\\/](${options['node_modules']
                .map(regexpEscaper)
                .join('|')
                })[\\\\/]`);

            delete options['node_modules'];
        }

        this.cacheGroups[name] = options;
    }

    copyFiles(configs: CopyFilesOptions | CopyFilesOptions[] = []): void {
        if (!Array.isArray(configs)) {
            configs = [configs];
        }

        if (configs.some(elt => typeof elt !== 'object')) {
            throw new Error('copyFiles() must be called with either a config object or an array of config objects.');
        }

        const defaultConfig = {
            from: null,
            pattern: /.*/,
            to: null,
            includeSubdirectories: true,
            context: null,
        };

        for (const config of configs) {
            if (!config.from) {
                throw new Error('Config objects passed to copyFiles() must have a "from" property.');
            }

            for (const configKey of Object.keys(config)) {
                if (!(configKey in defaultConfig)) {
                    throw new Error(`Invalid config option "${configKey}" passed to copyFiles(). Valid keys are ${Object.keys(defaultConfig).join(', ')}`);
                }
            }

            if (typeof config.pattern !== 'undefined' && !(config.pattern instanceof RegExp)) {
                let validPattern = false;
                if (typeof config.pattern === 'string') {
                    const regexPattern = /^\/(.*)\/([a-z]*)?$/;
                    if (regexPattern.test(config.pattern)) {
                        validPattern = true;
                    }
                }

                if (!validPattern) {
                    throw new Error(`Invalid pattern "${config.pattern}" passed to copyFiles(). Make sure it contains a valid regular expression.`);
                }
            }

            this.copyFilesConfigs.push(
                Object.assign({}, defaultConfig, config),
            );
        }
    }

    enablePostCssLoader(postCssLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        this.usePostCssLoader = true;

        if (typeof postCssLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enablePostCssLoader() must be a callback function.');
        }

        this.postCssLoaderOptionsCallback = postCssLoaderOptionsCallback;
    }

    enableSassLoader(
        sassLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }, options: SassLoaderEncoreOptions = {}): void {
        this.useSassLoader = true;

        if (typeof sassLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableSassLoader() must be a callback function.');
        }

        this.sassLoaderOptionsCallback = sassLoaderOptionsCallback;

        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.sassOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to enableSassLoader(). Valid keys are ${Object.keys(this.sassOptions).join(', ')}`);
            }

            this.sassOptions[optionKey] = options[optionKey];
        }
    }

    enableLessLoader(lessLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        this.useLessLoader = true;

        if (typeof lessLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableLessLoader() must be a callback function.');
        }

        this.lessLoaderOptionsCallback = lessLoaderOptionsCallback;
    }

    enableStylusLoader(stylusLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        this.useStylusLoader = true;

        if (typeof stylusLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableStylusLoader() must be a callback function.');
        }

        this.stylusLoaderOptionsCallback = stylusLoaderOptionsCallback;
    }

    enableStimulusBridge(controllerJsonPath: string): void {
        this.useStimulusBridge = true;

        if (!fs.existsSync(controllerJsonPath)) {
            throw new Error(`File "${controllerJsonPath}" could not be found.`);
        }

        // Add configured entrypoints
        const controllersData = JSON.parse(fs.readFileSync(controllerJsonPath, 'utf8'));
        const rootDir = path.dirname(path.resolve(controllerJsonPath));

        for (const name in controllersData.entrypoints) {
            this.addEntry(name, rootDir + '/' + controllersData.entrypoints[name]);
        }

        this.addAliases({
            '@symfony/stimulus-bridge/controllers.json': path.resolve(controllerJsonPath),
        });
    }

    enableBuildCache(
        buildDependencies: Record<string, string[]>,
        callback: OptionsCallback<webpack.FileCacheOptions> = (_cache) => { }): void {
        if (typeof buildDependencies !== 'object') {
            throw new Error('Argument 1 to enableBuildCache() must be an object.');
        }

        if (!buildDependencies.config) {
            throw new Error('Argument 1 to enableBuildCache() should contain an object with at least a "config" key. See the documentation for this method.');
        }

        this.usePersistentCache = true;
        this.persistentCacheBuildDependencies = buildDependencies;

        if (typeof callback !== 'function') {
            throw new Error('Argument 2 to enableBuildCache() must be a callback function.');
        }

        this.persistentCacheCallback = callback;
    }

    enableReactPreset(callback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableReactPreset() must be a callback function.');
        }

        this.useReact = true;
        this.babelReactPresetOptionsCallback = callback;
    }

    enablePreactPreset(options: PreactPresetEncoreOptions = {}): void {
        this.usePreact = true;

        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.preactOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to enablePreactPreset(). Valid keys are ${Object.keys(this.preactOptions).join(', ')}`);
            }

            this.preactOptions[optionKey] = options[optionKey];
        }
    }

    enableSvelte(): void {
        this.useSvelte = true;
    }

    enableTypeScriptLoader(callback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        if (this.useBabelTypeScriptPreset) {
            throw new Error('Encore.enableTypeScriptLoader() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        }

        this.useTypeScriptLoader = true;

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableTypeScriptLoader() must be a callback function.');
        }

        this.tsConfigurationCallback = callback;
    }

    enableForkedTypeScriptTypesChecking(forkedTypeScriptTypesCheckOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        if (this.useBabelTypeScriptPreset) {
            throw new Error('Encore.enableForkedTypeScriptTypesChecking() can not be called when Encore.enableBabelTypeScriptPreset() has been called.');
        }

        if (typeof forkedTypeScriptTypesCheckOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableForkedTypeScriptTypesChecking() must be a callback function.');
        }

        this.useForkedTypeScriptTypeChecking = true;
        this.forkedTypeScriptTypesCheckOptionsCallback
            = forkedTypeScriptTypesCheckOptionsCallback;
    }

    enableBabelTypeScriptPreset(options = {}): void {
        if (this.useTypeScriptLoader) {
            throw new Error('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableTypeScriptLoader() has been called.');
        }

        if (this.useForkedTypeScriptTypeChecking) {
            throw new Error('Encore.enableBabelTypeScriptPreset() can not be called when Encore.enableForkedTypeScriptTypesChecking() has been called.');
        }

        this.useBabelTypeScriptPreset = true;
        this.babelTypeScriptPresetOptions = options;
    }

    enableVueLoader(
        vueLoaderOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }, vueOptions: VueLoaderEncoreOptions = {}): void {
        this.useVueLoader = true;

        if (typeof vueLoaderOptionsCallback !== 'function') {
            throw new Error('Argument 1 to enableVueLoader() must be a callback function.');
        }

        this.vueLoaderOptionsCallback = vueLoaderOptionsCallback;

        // Check allowed keys
        for (const key of Object.keys(vueOptions)) {
            if (!(key in this.vueOptions)) {
                throw new Error(`"${key}" is not a valid key for enableVueLoader(). Valid keys: ${Object.keys(this.vueOptions).join(', ')}.`);
            }

            if (key === 'version' && vueOptions.version) {
                const validVersions: Array<string | number> = [2, 3];
                if (!validVersions.includes(vueOptions.version)) {
                    throw new Error(`"${vueOptions.version}" is not a valid value for the "version" option passed to enableVueLoader(). Valid versions are: ${validVersions.join(', ')}.`);
                }
            }

            this.vueOptions[key] = vueOptions[key];
        }
    }

    enableBuildNotifications(
        enabled: boolean = true,
        notifierPluginOptionsCallback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        if (typeof notifierPluginOptionsCallback !== 'function') {
            throw new Error('Argument 2 to enableBuildNotifications() must be a callback function.');
        }

        this.useWebpackNotifier = enabled;
        this.notifierPluginOptionsCallback = notifierPluginOptionsCallback;
    }

    enableHandlebarsLoader(callback: OptionsCallback<object & Record<string, any>> = () => { }): void {
        this.useHandlebarsLoader = true;

        if (typeof callback !== 'function') {
            throw new Error('Argument 1 to enableHandlebarsLoader() must be a callback function.');
        }

        this.handlebarsConfigurationCallback = callback;
    }

    disableCssExtraction(disabled = true): void {
        this.extractCss = !disabled;
    }

    configureFilenames(configuredFilenames: FilenamesOptions = {}): void {
        if (typeof configuredFilenames !== 'object') {
            throw new Error('Argument 1 to configureFilenames() must be an object.');
        }

        // Check allowed keys
        const validKeys = ['js', 'css', 'assets'];
        for (const key of Object.keys(configuredFilenames)) {
            if (!validKeys.includes(key)) {
                throw new Error(`"${key}" is not a valid key for configureFilenames(). Valid keys: ${validKeys.join(', ')}. Use configureImageRule() or configureFontRule() to control image or font filenames.`);
            }
        }

        this.configuredFilenames = configuredFilenames;
    }

    configureImageRule(
        options: ImageRuleOptions = {},
        ruleCallback: OptionsCallback<webpack.RuleSetRule> = () => { }): void {
        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.imageRuleOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to configureImageRule(). Valid keys are ${Object.keys(this.imageRuleOptions).join(', ')}`);
            }

            this.imageRuleOptions[optionKey] = options[optionKey];
        }

        if (this.imageRuleOptions.maxSize && this.imageRuleOptions.type !== 'asset') {
            throw new Error('Invalid option "maxSize" passed to configureImageRule(): this option is only valid when "type" is set to "asset".');
        }

        if (typeof ruleCallback !== 'function') {
            throw new Error('Argument 2 to configureImageRule() must be a callback function.');
        }

        this.imageRuleCallback = ruleCallback;
    }

    configureFontRule(options: FontRuleOptions = {}, ruleCallback: OptionsCallback<webpack.RuleSetRule> = () => { }): void {
        for (const optionKey of Object.keys(options)) {
            if (!(optionKey in this.fontRuleOptions)) {
                throw new Error(`Invalid option "${optionKey}" passed to configureFontRule(). Valid keys are ${Object.keys(this.fontRuleOptions).join(', ')}`);
            }

            this.fontRuleOptions[optionKey] = options[optionKey];
        }

        if (this.fontRuleOptions.maxSize && this.fontRuleOptions.type !== 'asset') {
            throw new Error('Invalid option "maxSize" passed to configureFontRule(): this option is only valid when "type" is set to "asset".');
        }

        if (typeof ruleCallback !== 'function') {
            throw new Error('Argument 2 to configureFontRule() must be a callback function.');
        }

        this.fontRuleCallback = ruleCallback;
    }

    cleanupOutputBeforeBuild(cleanOptionsCallback: OptionsCallback<Exclude<ConstructorParameters<typeof webpack.CleanPlugin>[0], undefined>> = () => { }): void {
        if (typeof cleanOptionsCallback !== 'function') {
            throw new Error('Argument 1 to cleanupOutputBeforeBuild() must be a callback function');
        }

        this.cleanupOutput = true;
        this.cleanOptionsCallback = cleanOptionsCallback;
    }

    autoProvideVariables(variables: Record<string, string | string[]>): void {
        // do a few sanity checks, so we can give better user errors
        if (typeof variables === 'string' || Array.isArray(variables)) {
            throw new Error('Invalid argument passed to autoProvideVariables: you must pass an object map - e.g. { $: "jquery" }');
        }

        // merge new variables into the object
        this.providedVariables = Object.assign(
            {},
            this.providedVariables,
            variables,
        );
    }

    autoProvidejQuery(): void {
        this.autoProvideVariables({
            '$': 'jquery',
            'jQuery': 'jquery',
            'window.jQuery': 'jquery',
        });
    }

    configureLoaderRule(name: string, callback: OptionsCallback<webpack.RuleSetRule>): void {
        // Key: alias, Value: existing loader in `this.loaderConfigurationCallbacks`
        const aliases: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            scss: 'sass',
        };

        if (name in aliases) {
            name = aliases[name] as string;
        }

        if (!(name in this.loaderConfigurationCallbacks)) {
            throw new Error(`Loader "${name}" is not configurable. Valid loaders are "${Object.keys(this.loaderConfigurationCallbacks).join('", "')}" and the aliases "${Object.keys(aliases).join('", "')}".`);
        }

        if (typeof callback !== 'function') {
            throw new Error('Argument 2 to configureLoaderRule() must be a callback function.');
        }

        this.loaderConfigurationCallbacks[name] = callback;
    }

    enableIntegrityHashes(enabled: boolean = true, algorithms: string | string[] = ['sha384']): void {
        if (!Array.isArray(algorithms)) {
            algorithms = [algorithms];
        }

        const availableHashes = crypto.getHashes();
        for (const algorithm of algorithms) {
            if (typeof algorithm !== 'string') {
                throw new Error('Argument 2 to enableIntegrityHashes() must be a string or an array of strings.');
            }

            if (!availableHashes.includes(algorithm)) {
                throw new Error(`Invalid hash algorithm "${algorithm}" passed to enableIntegrityHashes().`);
            }
        }

        this.integrityAlgorithms = enabled ? algorithms : [];
    }

    useDevServer(): boolean {
        return this.runtimeConfig.useDevServer;
    }

    isProduction(): boolean {
        return this.runtimeConfig.environment === 'production';
    }

    isDev(): boolean {
        return this.runtimeConfig.environment === 'dev';
    }

    isDevServer(): boolean {
        return this.isDev() && this.runtimeConfig.useDevServer;
    }

    validateNameIsNewEntry(name: string): void {
        const entryNamesOverlapMsg = 'The entry names between addEntry(), addEntries(), and addStyleEntry() must be unique.';

        if (this.entries.has(name)) {
            throw new Error(`Duplicate name "${name}" already exists as an Entrypoint. ${entryNamesOverlapMsg}`);
        }

        if (this.styleEntries.has(name)) {
            throw new Error(`The "${name}" already exists as a Style Entrypoint. ${entryNamesOverlapMsg}`);
        }
    }
}

export type ValidatedWebpackConfig = WebpackConfig & {
    outputPath: string;
    publicPath: string;
};

export default WebpackConfig;
