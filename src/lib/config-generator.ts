/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
/// <reference types="webpack-dev-server" />

import type webpack from 'webpack';
import type WebpackConfig from './WebpackConfig.ts';

import * as pathUtil from './config/path-util.ts';
import * as featuresHelper from './features.ts';
import * as cssExtractLoaderUtil from './loaders/css-extract.ts';
// loaders utils
import * as babelLoaderUtil from './loaders/babel.ts';
import * as cssLoaderUtil from './loaders/css.ts';
import * as handlebarsLoaderUtil from './loaders/handlebars.ts';
import * as lessLoaderUtil from './loaders/less.ts';
import * as sassLoaderUtil from './loaders/sass.ts';
import * as stylusLoaderUtil from './loaders/stylus.ts';
import * as tsLoaderUtil from './loaders/typescript.ts';
import * as vueLoaderUtil from './loaders/vue.ts';
// plugins utils
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import tmp from 'tmp';
import type { RuleSetRule } from 'webpack';
import * as logger from './logger.ts';
import assetOutputDisplay from './plugins/asset-output-display.ts';
import definePluginUtil from './plugins/define.ts';
import deleteUnusedEntriesPluginUtil from './plugins/delete-unused-entries.ts';
import entryFilesManifestPlugin from './plugins/entry-files-manifest.ts';
import friendlyErrorPluginUtil from './plugins/friendly-errors.ts';
import manifestPluginUtil from './plugins/manifest.ts';
import miniCssExtractPluginUtil from './plugins/mini-css-extract.ts';
import notifierPluginUtil from './plugins/notifier.ts';
import optimizeCssAssetsUtil from './plugins/optimize-css-assets.ts';
import PluginPriorities from './plugins/plugin-priorities.ts';
import terserPluginUtil from './plugins/terser.ts';
import variableProviderPluginUtil from './plugins/variable-provider.ts';
import vuePluginUtil from './plugins/vue.ts';
import applyOptionsCallback, { type OptionsCallback } from './utils/apply-options-callback.ts';
import copyEntryTmpName from './utils/copyEntryTmpName.ts';
import getVueVersion from './utils/get-vue-version.ts';
import stringEscaper from './utils/string-escaper.ts';

export type DevServerOptions = Exclude<webpack.Configuration['devServer'], undefined> & {
    /**
     * @deprecated The "https" option inside of configureDevServerOptions() is deprecated. Use "server = \{ type: \'https\' \}" instead.
     */
    https?: unknown;
    // static: {
    //     directory: string;
    // };
    // headers: Record<string, string>;
    // compress: boolean;
    // historyApiFallback: boolean;
    // liveReload: boolean;
    // host: string | null;
    // port: number | null;
    // key?: string;
    // cert?: string;
    // server?: string | (Record<string, unknown> & {
    //     type?: string;
    // });
};

export interface AssetRuleOptions {
    filename?: string;
    maxSize?: number | null;
    type?: string;
    enabled?: boolean;
}

class ConfigGenerator {
    constructor(public webpackConfig: WebpackConfig) {
    }

    getWebpackConfig() {
        const devServerConfig = this.webpackConfig.useDevServer() ? this.buildDevServerConfig() : null;
        /*
         * An unfortunate situation where we need to configure the final runtime
         * config later in the process. The problem is that devServer https can
         * be activated with either a --server-type=https flag or by setting the devServer.server.type='https'
         * config to true. So, only at this moment can we determine
         * if https has been activated by either method.
         */
        if (devServerConfig
            && (
                devServerConfig.https
                || devServerConfig.server === 'https'
                || (typeof devServerConfig.server === 'object' && devServerConfig.server.type === 'https')
                || this.webpackConfig.runtimeConfig.devServerHttps
            )) {
            this.webpackConfig.runtimeConfig.devServerFinalIsHttps = true;

            if (devServerConfig.https) {
                logger.deprecation('The "https" option inside of configureDevServerOptions() is deprecated. Use "server = { type: \'https\' }" instead.');
            }
        }
        else {
            this.webpackConfig.runtimeConfig.devServerFinalIsHttps = false;
        }

        const config: webpack.Configuration = {
            context: this.webpackConfig.getContext(),
            entry: this.buildEntryConfig(),
            mode: this.webpackConfig.isProduction() ? 'production' : 'development',
            output: this.buildOutputConfig(),
            module: {
                rules: this.buildRulesConfig(),
            },
            plugins: this.buildPluginsConfig(),
            optimization: this.buildOptimizationConfig(),
            watchOptions: this.buildWatchOptionsConfig(),
            devtool: false,
        };

        if (this.webpackConfig.usePersistentCache) {
            config.cache = this.buildCacheConfig();
        }

        if (this.webpackConfig.useSourceMaps) {
            if (this.webpackConfig.isProduction()) {
                // https://webpack.js.org/configuration/devtool/#for-production
                config.devtool = 'source-map';
            }
            else {
                // https://webpack.js.org/configuration/devtool/#for-development
                config.devtool = 'inline-source-map';
            }
        }

        if (null !== devServerConfig) {
            config.devServer = devServerConfig;
        }

        config.performance = {
            // silence performance hints
            hints: false,
        };

        config.stats = this.buildStatsConfig();

        config.resolve = {
            extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx', '.vue', '.ts', '.tsx', '.svelte'],
            alias: {},
        };

        if (this.webpackConfig.useVueLoader && (this.webpackConfig.vueOptions.runtimeCompilerBuild === true || this.webpackConfig.vueOptions.runtimeCompilerBuild === null)) {
            if (this.webpackConfig.vueOptions.runtimeCompilerBuild === null) {
                logger.recommendation('To create a smaller (and CSP-compliant) build, see https://symfony.com/doc/current/frontend/encore/vuejs.html#runtime-compiler-build');
            }

            const vueVersion = getVueVersion(this.webpackConfig);
            switch (vueVersion) {
                case 2:
                case '2.7':
                    throw new Error('The support for Vue 2 has been removed.'
                        + ' Please upgrade to Vue 3, and if necessary remove the "version" setting or set it to 3 when calling ".enableVueLoader()".');
                case 3:
                    // @ts-expect-error The alias field doesn't have a Record type. Check if this configuration is valid.
                    config.resolve.alias['vue$'] = 'vue/dist/vue.esm-bundler.js';
                    break;
                default:
                    throw new Error(`Invalid vue version ${vueVersion}`);
            }
        }

        if (this.webpackConfig.usePreact && this.webpackConfig.preactOptions.preactCompat) {
            // @ts-expect-error The alias field doesn't have a Record type. Check if this configuration is valid.
            config.resolve.alias['react'] = 'preact/compat';
            // @ts-expect-error The alias field doesn't have a Record type. Check if this configuration is valid.
            config.resolve.alias['react-dom'] = 'preact/compat';
        }

        // @ts-expect-error The alias field doesn't have a Record type. Check if this configuration is valid.
        Object.assign(config.resolve.alias, this.webpackConfig.aliases);

        // @ts-expect-error Validate if this behavior can handle all cases
        config.externals = [...this.webpackConfig.externals];

        return config;
    }

    buildEntryConfig() {
        const entry: Record<string, string | string[]> = {};

        for (const [entryName, entryChunks] of this.webpackConfig.entries) {
            // entryFile could be an array, we don't care
            entry[entryName] = entryChunks;
        }

        for (const [entryName, entryChunks] of this.webpackConfig.styleEntries) {
            // entryFile could be an array, we don't care
            entry[entryName] = entryChunks;
        }

        if (this.webpackConfig.copyFilesConfigs.length > 0) {
            featuresHelper.ensurePackagesExistAndAreCorrectVersion('copy_files');
        }

        const copyFilesConfigs = this.webpackConfig.copyFilesConfigs.filter((entry) => {
            const copyFrom = path.resolve(
                this.webpackConfig.getContext(),
                entry.from,
            );

            if (!fs.existsSync(copyFrom)) {
                logger.warning(`The "from" option of copyFiles() should be set to an existing directory but "${entry.from}" does not seem to exist. Nothing will be copied for this copyFiles() config object.`);
                return false;
            }

            if (!fs.lstatSync(copyFrom).isDirectory()) {
                logger.warning(`The "from" option of copyFiles() should be set to an existing directory but "${entry.from}" seems to be a file. Nothing will be copied for this copyFiles() config object.`);
                return false;
            }

            return true;
        });

        if (copyFilesConfigs.length > 0) {
            // TODO: Consider if we should handle exceptions of fileSync

            const tmpFileObject = tmp.fileSync();
            fs.writeFileSync(
                tmpFileObject.name,
                copyFilesConfigs.reduce((buffer, entry, index) => {
                    const copyFrom = path.resolve(
                        this.webpackConfig.getContext(),
                        entry.from,
                    );

                    let copyTo = entry.to;
                    if (copyTo === null) {
                        copyTo = this.webpackConfig.useVersioning ? '[path][name].[hash:8].[ext]' : '[path][name].[ext]';
                    }

                    const copyFilesLoaderPath = createRequire(import.meta.url).resolve('./webpack/copy-files-loader.cjs');
                    const copyFilesLoaderConfig = `${copyFilesLoaderPath}?${JSON.stringify({
                        // file-loader options
                        context: entry.context ? path.resolve(this.webpackConfig.getContext(), entry.context) : copyFrom,
                        name: copyTo,

                        // custom copy-files-loader options
                        // the patternSource is base64 encoded in case
                        // it contains characters that don't work with
                        // the "inline loader" syntax
                        // @ts-expect-error This only works if entry.pattern is a RegExp but it could also be a string. Also consider a way to handle that
                        patternSource: Buffer.from(entry.pattern.source).toString('base64'),
                        // @ts-expect-error This only works if entry.pattern is a RegExp but it could also be a string. Also consider a way to handle that
                        patternFlags: entry.pattern.flags,
                    })}`;

                    return buffer + `
                        const context_${index} = require.context(
                            '${stringEscaper(`!!${copyFilesLoaderConfig}!${copyFrom}?copy-files-loader`)}',
                            ${!!entry.includeSubdirectories},
                            ${entry.pattern}
                        );
                        context_${index}.keys().forEach(context_${index});
                    `;
                }, ''),
            );

            entry[copyEntryTmpName] = tmpFileObject.name;
        }

        return entry;
    }

    buildOutputConfig(): Required<webpack.Configuration>['output'] {
        // Default filename can be overridden using Encore.configureFilenames({ js: '...' })
        let filename = this.webpackConfig.useVersioning ? '[name].[contenthash:8].js' : '[name].js';
        if (this.webpackConfig.configuredFilenames.js) {
            filename = this.webpackConfig.configuredFilenames.js;
        }

        const outputConfig: webpack.Configuration['output'] = {
            clean: this.buildCleanConfig(),
            filename,
            // default "asset module" filename
            // this is overridden for the image & font rules
            assetModuleFilename: this.webpackConfig.configuredFilenames.assets ? this.webpackConfig.configuredFilenames.assets : 'assets/[name].[hash:8][ext]',
            pathinfo: !this.webpackConfig.isProduction(),
        };
        if (this.webpackConfig.outputPath) {
            outputConfig.path = this.webpackConfig.outputPath;
        }
        const realPublicPath = this.webpackConfig.getRealPublicPath();
        if (realPublicPath) {
            // will use the CDN path (if one is available) so that split
            // chunks load internally through the CDN.
            outputConfig.publicPath = realPublicPath;
        }

        return outputConfig;
    }

    /**
     * @returns
     */
    buildCleanConfig() {
        if (!this.webpackConfig.cleanupOutput) {
            return false;
        }

        return applyOptionsCallback(this.webpackConfig.cleanOptionsCallback, {});
    }

    buildRulesConfig() {
        const applyRuleConfigurationCallback = (name: string, defaultRules: webpack.RuleSetRule) => {
            return applyOptionsCallback(this.webpackConfig.loaderConfigurationCallbacks[name]!, defaultRules);
        };

        function generateAssetRuleConfig(
            testRegex: RegExp,
            ruleOptions: AssetRuleOptions,
            ruleCallback: OptionsCallback<RuleSetRule>,
            ruleName: string,
        ) {
            const generatorOptions: { filename?: string } = {};
            if (ruleOptions.filename) {
                generatorOptions.filename = ruleOptions.filename;
            }
            const parserOptions: { dataUrlCondition?: { maxSize: number } } = {};
            if (ruleOptions.maxSize) {
                parserOptions.dataUrlCondition = {
                    maxSize: ruleOptions.maxSize,
                };
            }

            // apply callback from, for example, configureImageRule()
            const ruleConfig = applyOptionsCallback(
                ruleCallback,
                {
                    test: testRegex,
                    oneOf: [
                        {
                            resourceQuery: /copy-files-loader/,
                            type: 'javascript/auto',
                        },
                        {
                            type: ruleOptions.type,
                            generator: generatorOptions,
                            parser: parserOptions,
                        } as webpack.RuleSetRule,
                    ],
                },
            );

            // apply callback from lower-level configureLoaderRule()
            return applyRuleConfigurationCallback(ruleName, ruleConfig);
        };

        // When the PostCSS loader is enabled, allow to use
        // files with the `.postcss` extension. It also
        // makes it possible to use `lang="postcss"` in Vue
        // files.
        const cssExtensions = ['css'];
        if (this.webpackConfig.usePostCssLoader) {
            cssExtensions.push('pcss');
            cssExtensions.push('postcss');
        }

        const jsRules: webpack.RuleSetRule = {
            test: babelLoaderUtil.getTest(this.webpackConfig),
            use: babelLoaderUtil.getLoaders(this.webpackConfig),
        };
        if (this.webpackConfig.babelOptions.exclude) {
            jsRules.exclude = this.webpackConfig.babelOptions.exclude;
        }
        const rules = [
            applyRuleConfigurationCallback('javascript', jsRules),
            applyRuleConfigurationCallback('css', {
                resolve: {
                    mainFields: ['style', 'main'],
                    extensions: cssExtensions.map(ext => `.${ext}`),
                },
                test: new RegExp(`\\.(${cssExtensions.join('|')})$`),
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(
                            this.webpackConfig,
                            cssLoaderUtil.getLoaders(this.webpackConfig, true),
                        ),
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(
                            this.webpackConfig,
                            cssLoaderUtil.getLoaders(this.webpackConfig),
                        ),
                    },
                ],
            }),
        ];

        if (this.webpackConfig.imageRuleOptions.enabled) {
            rules.push(generateAssetRuleConfig(
                /\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/,
                this.webpackConfig.imageRuleOptions,
                this.webpackConfig.imageRuleCallback,
                'images',
            ));
        }

        if (this.webpackConfig.fontRuleOptions.enabled) {
            rules.push(generateAssetRuleConfig(
                /\.(woff|woff2|ttf|eot|otf)$/,
                this.webpackConfig.fontRuleOptions,
                this.webpackConfig.fontRuleCallback,
                'fonts',
            ));
        }

        if (this.webpackConfig.useSassLoader) {
            rules.push(applyRuleConfigurationCallback('sass', {
                resolve: {
                    mainFields: ['sass', 'style', 'main'],
                    extensions: ['.scss', '.sass', '.css'],
                },
                test: /\.s[ac]ss$/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, sassLoaderUtil.getLoaders(this.webpackConfig, true)),
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, sassLoaderUtil.getLoaders(this.webpackConfig)),
                    },
                ],
            }));
        }

        if (this.webpackConfig.useLessLoader) {
            rules.push(applyRuleConfigurationCallback('less', {
                test: /\.less/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, lessLoaderUtil.getLoaders(this.webpackConfig, true)),
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, lessLoaderUtil.getLoaders(this.webpackConfig)),
                    },
                ],
            }));
        }

        if (this.webpackConfig.useStylusLoader) {
            rules.push(applyRuleConfigurationCallback('stylus', {
                test: /\.styl/,
                oneOf: [
                    {
                        resourceQuery: /module/,
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, stylusLoaderUtil.getLoaders(this.webpackConfig, true)),
                    },
                    {
                        use: cssExtractLoaderUtil.prependLoaders(this.webpackConfig, stylusLoaderUtil.getLoaders(this.webpackConfig)),
                    },
                ],
            }));
        }

        if (this.webpackConfig.useSvelte) {
            rules.push(applyRuleConfigurationCallback('svelte', {
                resolve: {
                    mainFields: ['svelte', 'browser', 'module', 'main'],
                    extensions: ['.mjs', '.js', '.svelte'],
                },
                test: /\.svelte$/,
                loader: 'svelte-loader',
            }));
        }

        if (this.webpackConfig.useVueLoader) {
            rules.push(applyRuleConfigurationCallback('vue', {
                test: /\.vue$/,
                use: vueLoaderUtil.getLoaders(this.webpackConfig),
            }));
        }

        if (this.webpackConfig.useTypeScriptLoader) {
            rules.push(applyRuleConfigurationCallback('typescript', {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: tsLoaderUtil.getLoaders(this.webpackConfig),
            }));
        }

        if (this.webpackConfig.useHandlebarsLoader) {
            rules.push(applyRuleConfigurationCallback('handlebars', {
                test: /\.(handlebars|hbs)$/,
                use: handlebarsLoaderUtil.getLoaders(this.webpackConfig),
            }));
        }

        this.webpackConfig.loaders.forEach((loader) => {
            rules.push(loader);
        });

        return rules;
    }

    buildPluginsConfig() {
        const plugins: Array<{
            plugin: webpack.WebpackPluginInstance;
            priority: number;
        }> = [];

        miniCssExtractPluginUtil(plugins, this.webpackConfig);

        // register the pure-style entries that should be deleted
        deleteUnusedEntriesPluginUtil(plugins, this.webpackConfig);

        entryFilesManifestPlugin(plugins, this.webpackConfig);

        // Dump the manifest.json file
        manifestPluginUtil(plugins, this.webpackConfig);

        variableProviderPluginUtil(plugins, this.webpackConfig);

        definePluginUtil(plugins, this.webpackConfig);

        notifierPluginUtil(plugins, this.webpackConfig);

        vuePluginUtil(plugins, this.webpackConfig);

        if (!this.webpackConfig.runtimeConfig.outputJson) {
            const friendlyErrorPlugin = friendlyErrorPluginUtil(this.webpackConfig);
            plugins.push({
                plugin: friendlyErrorPlugin,
                priority: PluginPriorities.FriendlyErrorsWebpackPlugin,
            });

            assetOutputDisplay(plugins, this.webpackConfig, friendlyErrorPlugin);
        }

        this.webpackConfig.plugins.forEach(function (plugin) {
            plugins.push(plugin);
        });

        // Return sorted plugins
        return plugins
            .map((plugin, position) => Object.assign({}, plugin, { position: position }))
            .sort((a, b) => {
                // Keep the original order if two plugins have the same priority
                if (a.priority === b.priority) {
                    return a.position - b.position;
                }

                // A plugin with a priority of -10 will be placed after one
                // that has a priority of 0.
                return b.priority - a.priority;
            })
            .map(plugin => plugin.plugin);
    }

    buildOptimizationConfig(): Required<webpack.Configuration>['optimization'] {
        const optimization: Required<webpack.Configuration>['optimization'] = {

        };

        if (this.webpackConfig.isProduction()) {
            optimization.minimizer = [
                terserPluginUtil(this.webpackConfig) as webpack.WebpackPluginInstance,
                optimizeCssAssetsUtil(this.webpackConfig) as webpack.WebpackPluginInstance,
            ];
        }

        const splitChunks: Required<webpack.Configuration>['optimization']['splitChunks'] = {
            chunks: this.webpackConfig.shouldSplitEntryChunks ? 'all' : 'async',
        };

        const cacheGroups: Record<string, Exclude<Required<webpack.Configuration>['optimization']['splitChunks'], undefined>> = {};
        for (const groupName in this.webpackConfig.cacheGroups) {
            (cacheGroups as Record<string, unknown>)[groupName] = Object.assign(
                {
                    name: groupName,
                    chunks: 'all',
                    enforce: true,
                },
                this.webpackConfig.cacheGroups[groupName],
            );
        }

        splitChunks.cacheGroups = cacheGroups;
        if (this.webpackConfig.shouldUseSingleRuntimeChunk === null) {
            throw new Error('Either the Encore.enableSingleRuntimeChunk() or Encore.disableSingleRuntimeChunk() method should be called. The recommended setting is Encore.enableSingleRuntimeChunk().');
        }

        if (this.webpackConfig.shouldUseSingleRuntimeChunk) {
            optimization.runtimeChunk = ('single') as const;
        }

        optimization.splitChunks = applyOptionsCallback(
            this.webpackConfig.splitChunksConfigurationCallback,
            splitChunks,
        );

        return optimization;
    }

    buildCacheConfig(): webpack.FileCacheOptions {
        const cache: webpack.FileCacheOptions = {
            type: 'filesystem',
        };

        cache.buildDependencies = this.webpackConfig.persistentCacheBuildDependencies;

        applyOptionsCallback(
            this.webpackConfig.persistentCacheCallback,
            cache,
        );

        return cache;
    }

    buildStatsConfig() {
        // try to silence as much as possible: the output is rarely helpful
        // this still doesn't remove all output
        let stats = {};

        if (!this.webpackConfig.runtimeConfig.outputJson && !this.webpackConfig.runtimeConfig.profile) {
            stats = {
                hash: false,
                version: false,
                timings: false,
                assets: false,
                chunks: false,
                modules: false,
                reasons: false,
                children: false,
                source: false,
                errors: false,
                errorDetails: false,
                warnings: false,
                publicPath: false,
                builtAt: false,
            };
        }

        return stats;
    }

    buildWatchOptionsConfig() {
        const watchOptions = {
            ignored: /node_modules/,
        };

        return applyOptionsCallback(
            this.webpackConfig.watchOptionsConfigurationCallback,
            watchOptions,
        );
    }

    buildDevServerConfig(): DevServerOptions {
        const contentBase = pathUtil.getContentBase(this.webpackConfig);

        const devServerOptions: DevServerOptions = {
            static: {
                directory: contentBase,
            },
            // avoid CORS concerns trying to load things like fonts from the dev server
            headers: { 'Access-Control-Allow-Origin': '*' },
            compress: true,
            historyApiFallback: true,
            // In webpack-dev-server v4 beta 0, liveReload always causes
            // the page to refresh, not allowing HMR to update the page.
            // This is somehow related to the "static" option, but it's
            // unknown if there is a better option.
            // See https://github.com/webpack/webpack-dev-server/issues/2893
            liveReload: false,
            // see https://github.com/symfony/webpack-encore/issues/931#issuecomment-784483725
            host: this.webpackConfig.runtimeConfig.devServerHost || undefined,
            // see https://github.com/symfony/webpack-encore/issues/941#issuecomment-787568811
            // we cannot let webpack-dev-server find an open port, because we need
            // to know the port for sure at Webpack config build time
            port: this.webpackConfig.runtimeConfig.devServerPort || undefined,
        };

        return applyOptionsCallback(
            this.webpackConfig.devServerOptionsConfigurationCallback,
            devServerOptions,
        );
    }
}

/**
 * @param webpackConfig - A configured WebpackConfig object
 * @returns The final webpack config object
 */
export default function (webpackConfig: WebpackConfig) {
    const generator = new ConfigGenerator(webpackConfig);

    return generator.getWebpackConfig();
};
