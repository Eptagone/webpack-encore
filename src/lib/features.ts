/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as packageHelper from './package-helper.ts';

interface Feature {
    method: string;
    packages: Array<packageHelper.PackageConfiguration | packageHelper.PackageConfiguration[]>;
    description: string;
};

/**
 * An object that holds internal configuration about different
 * "loaders"/"plugins" that can be enabled/used.
 */
const features: Record<string, Feature> = {
    'sass': {
        method: 'enableSassLoader()',
        packages: [
            { name: 'sass-loader', enforce_version: true },
            [{ name: 'sass' }, { name: 'sass-embedded' }, { name: 'node-sass' }],
        ],
        description: 'load Sass files',
    },
    'less': {
        method: 'enableLessLoader()',
        packages: [
            { name: 'less-loader', enforce_version: true },
        ],
        description: 'load LESS files',
    },
    'stylus': {
        method: 'enableStylusLoader()',
        packages: [
            { name: 'stylus-loader', enforce_version: true },
        ],
        description: 'load Stylus files',
    },
    'postcss': {
        method: 'enablePostCssLoader()',
        packages: [
            { name: 'postcss-loader', enforce_version: true },
        ],
        description: 'process through PostCSS',
    },
    'react': {
        method: 'enableReactPreset()',
        packages: [
            { name: '@babel/preset-react', enforce_version: true },
        ],
        description: 'process React JS files',
    },
    'preact': {
        method: 'enablePreactPreset()',
        packages: [
            { name: '@babel/plugin-transform-react-jsx', enforce_version: true },
        ],
        description: 'process Preact JS files',
    },
    'typescript': {
        method: 'enableTypeScriptLoader()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader', enforce_version: true },
        ],
        description: 'process TypeScript files',
    },
    'forkedtypecheck': {
        method: 'enableForkedTypeScriptTypesChecking()',
        packages: [
            { name: 'typescript' },
            { name: 'ts-loader', enforce_version: true },
            { name: 'fork-ts-checker-webpack-plugin', enforce_version: true },
        ],
        description: 'check TypeScript types in a separate process',
    },
    'typescript-babel': {
        method: 'enableBabelTypeScriptPreset',
        packages: [
            { name: 'typescript' },
            { name: '@babel/preset-typescript', enforce_version: true },
        ],
        description: 'process TypeScript files with Babel',
    },
    'vue3': {
        method: 'enableVueLoader()',
        // vue is needed so the end-user can do things
        // @vue/compiler-sfc is an optional peer dep of vue-loader
        packages: [
            { name: 'vue', enforce_version: true },
            { name: 'vue-loader', enforce_version: true },
            { name: '@vue/compiler-sfc' },
        ],
        description: 'load Vue files',
    },
    'vue-jsx': {
        method: 'enableVueLoader()',
        packages: [
            { name: '@vue/babel-preset-jsx' },
            { name: '@vue/babel-helper-vue-jsx-merge-props' },
        ],
        description: 'use Vue with JSX support',
    },
    'vue3-jsx': {
        method: 'enableVueLoader()',
        packages: [
            { name: '@vue/babel-plugin-jsx' },
        ],
        description: 'use Vue with JSX support',
    },
    'copy_files': {
        method: 'copyFiles()',
        packages: [
            { name: 'file-loader', enforce_version: true },
        ],
        description: 'Copy files',
    },
    'notifier': {
        method: 'enableBuildNotifications()',
        packages: [
            { name: 'webpack-notifier', enforce_version: true },
        ],
        description: 'display build notifications',
    },
    'handlebars': {
        method: 'enableHandlebarsLoader()',
        packages: [
            { name: 'handlebars' },
            { name: 'handlebars-loader', enforce_version: true },
        ],
        description: 'load Handlebars files',
    },
    'stimulus': {
        method: 'enableStimulusBridge()',
        packages: [
            { name: '@symfony/stimulus-bridge', enforce_version: true },
        ],
        description: 'enable Stimulus bridge',
    },
    'svelte': {
        method: 'enableSvelte()',
        packages: [
            { name: 'svelte', enforce_version: true },
            { name: 'svelte-loader', enforce_version: true },
        ],
        description: 'process Svelte JS files',
    },
    'webpack-dev-server': {
        method: 'configureDevServerOptions()',
        packages: [
            { name: 'webpack-dev-server' },
        ],
        description: 'run the Webpack development server',
    },
};

function getFeatureConfig(featureName: string): Feature {
    if (!features[featureName]) {
        throw new Error(`Unknown feature ${featureName}`);
    }

    return features[featureName];
}

export function ensurePackagesExistAndAreCorrectVersion(featureName: string, method: string | null = null) {
    const config = getFeatureConfig(featureName);

    packageHelper.ensurePackagesExist(
        packageHelper.addPackagesVersionConstraint(config.packages),
        method || config.method,
    );
}

export function getMissingPackageRecommendations(featureName: string) {
    const config = getFeatureConfig(featureName);

    return packageHelper.getMissingPackageRecommendations(
        packageHelper.addPackagesVersionConstraint(config.packages),
        config.method,
    );
}

export function getFeatureMethod(featureName: string): string {
    return getFeatureConfig(featureName).method;
}

export function getFeatureDescription(featureName: string): string {
    return getFeatureConfig(featureName).description;
}
