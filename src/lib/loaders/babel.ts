/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { PluginItem } from '@babel/core';
import { createRequire } from 'module';
import type WebpackConfig from '../WebpackConfig.ts';
import * as loaderFeatures from '../features.ts';
import applyOptionsCallback from '../utils/apply-options-callback.ts';

const require = createRequire(import.meta.url);

export interface BabelConfiguration extends Record<string, unknown> {
    cacheDirectory: boolean;
    sourceType: string;
    presets?: PluginItem[];
    plugins?: PluginItem[];
}

export interface BabelOptionsBase extends Record<string, unknown> {
    /**
    * Set the "useBuiltIns" option of \@babel/preset-env that changes
    * how it handles polyfills (https://babeljs.io/docs/en/babel-preset-env#usebuiltins)
    * Using it with 'entry' will require you to import core-js
    * once in your whole app and will result in that import being replaced
    * by individual polyfills. Using it with 'usage' will try to
    * automatically detect which polyfills are needed for each file and
    * add them accordingly.
    * Cannot be used if you have an external Babel configuration (a .babelrc
    * file for instance). In this case you can set the option directly into
    * that configuration file.
    * @defaultValue false
    */
    useBuiltIns?: 'usage' | 'entry' | false;

    /**
     * Set the "corejs" option of \@babel/preset-env.
     * It should contain the version of core-js you added to your project
     * if useBuiltIns isn't set to false.
     */
    corejs?: number | string | {
        version: string;
        proposals: boolean;
    } | null;
}

export interface BabelPresetEnvOptions extends BabelOptionsBase {
    modules?: boolean;
    targets?: Record<string, unknown>;
}

/**
 * @param webpackConfig -
 * @returns Array of loaders to use for Babel
 */
export function getLoaders(webpackConfig: WebpackConfig): WebpackLoader[] {
    let babelConfig: BabelConfiguration = {
        // improves performance by caching babel compiles
        // this option is always added but is set to FALSE in
        // production to avoid cache invalidation issues caused
        // by some Babel presets/plugins (for instance the ones
        // that use browserslist)
        // https://github.com/babel/babel-loader#options
        cacheDirectory: !webpackConfig.isProduction(),

        // let Babel guess which kind of import/export syntax
        // it should use based on the content of files
        sourceType: 'unambiguous',
    };

    // configure babel (unless the user is specifying .babelrc)
    // todo - add a sanity check for their babelrc contents
    if (!webpackConfig.doesBabelRcFileExist()) {
        let presetEnvOptions: BabelPresetEnvOptions = {
            // modules don't need to be transformed - webpack will parse
            // the modules for us. This is a performance improvement
            // https://babeljs.io/docs/en/babel-preset-env#modules
            modules: false,
            targets: {},
        };
        if (webpackConfig.babelOptions.useBuiltIns !== undefined) {
            presetEnvOptions.useBuiltIns = webpackConfig.babelOptions.useBuiltIns;
        }
        if (webpackConfig.babelOptions.corejs !== undefined) {
            presetEnvOptions.corejs = webpackConfig.babelOptions.corejs;
        }

        presetEnvOptions = applyOptionsCallback(
            webpackConfig.babelPresetEnvOptionsCallback,
            presetEnvOptions,
        );

        Object.assign(babelConfig, {
            presets: [
                [require.resolve('@babel/preset-env'), presetEnvOptions],
            ],
            plugins: [],
        });
        babelConfig.presets ??= [];
        babelConfig.plugins ??= [];

        if (webpackConfig.useBabelTypeScriptPreset) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('typescript-babel');

            babelConfig.presets.push([require.resolve('@babel/preset-typescript'), webpackConfig.babelTypeScriptPresetOptions]);
        }

        if (webpackConfig.useReact) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('react');

            babelConfig.presets.push([
                require.resolve('@babel/preset-react'),
                applyOptionsCallback(webpackConfig.babelReactPresetOptionsCallback, {
                    // TODO: To remove when Babel 8, "automatic" will become the default value
                    runtime: 'automatic',
                }),
            ]);
        }

        if (webpackConfig.usePreact) {
            loaderFeatures.ensurePackagesExistAndAreCorrectVersion('preact');

            if (webpackConfig.preactOptions.preactCompat) {
                // If preact-compat is enabled tell babel to
                // transform JSX into React.createElement calls.
                babelConfig.plugins.push([require.resolve('@babel/plugin-transform-react-jsx')]);
            }
            else {
                // If preact-compat is disabled tell babel to
                // transform JSX into Preact h() calls.
                babelConfig.plugins.push([
                    require.resolve('@babel/plugin-transform-react-jsx'),
                    { pragma: 'h' },
                ]);
            }
        }

        if (webpackConfig.useVueLoader && webpackConfig.vueOptions.useJsx) {
            // TODO v5: Only keep the v3 code path
            if (webpackConfig.vueOptions.version === 3) {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue3-jsx');
                babelConfig.plugins.push(require.resolve('@vue/babel-plugin-jsx'));
            }
            else {
                loaderFeatures.ensurePackagesExistAndAreCorrectVersion('vue-jsx');
                babelConfig.presets.push(require.resolve('@vue/babel-preset-jsx'));
            }
        }

        babelConfig = applyOptionsCallback(webpackConfig.babelConfigurationCallback, babelConfig);
    }

    return [
        {
            loader: require.resolve('babel-loader'),
            options: babelConfig,
        },
    ];
}

/**
 * @param webpackConfig -
 * @returns to use for eslint-loader `test` rule
 */
export function getTest(webpackConfig: WebpackConfig): RegExp {
    const extensions = [
        'm?jsx?', // match .js and .jsx and .mjs
    ];

    if (webpackConfig.useBabelTypeScriptPreset) {
        extensions.push('tsx?'); // match .ts and .tsx
    }

    return new RegExp(`\\.(${extensions.join('|')})$`);
}
