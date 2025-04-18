/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import RuntimeConfig from '../../src/lib/config/RuntimeConfig.ts';
import * as babelLoader from '../../src/lib/loaders/babel.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function createConfig() {
    const runtimeConfig = new RuntimeConfig();
    runtimeConfig.context = __dirname;
    runtimeConfig.babelRcFileExists = false;

    return new WebpackConfig(runtimeConfig);
}

describe('loaders/babel', () => {
    it('getLoaders() basic usage', () => {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = false;
        config.configureBabel(function (config) {
            config.foo = 'bar';
        });

        const actualLoaders = babelLoader.getLoaders(config);
        expect(actualLoaders).to.have.lengthOf(1);
        // the env preset is enabled by default
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.presets).to.have.lengthOf(1);
        // callback is used
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0]!.options.foo).to.equal('bar');
    });

    it('getLoaders() when .babelrc IS present', () => {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;

        const actualLoaders = babelLoader.getLoaders(config);
        // we only add cacheDirectory
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options).to.deep.equal({
            cacheDirectory: true,
            sourceType: 'unambiguous',
        });
    });

    it('getLoaders() for production', () => {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = true;
        config.runtimeConfig.environment = 'production';

        const actualLoaders = babelLoader.getLoaders(config);
        // cacheDirectory is disabled in production mode
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options).to.deep.equal({
            cacheDirectory: false,
            sourceType: 'unambiguous',
        });
    });

    it('getLoaders() with react', () => {
        const config = createConfig();
        config.enableReactPreset();

        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // env, react & foo
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets).to.have.lengthOf(3);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[0]).to.deep.equal([
            require.resolve('@babel/preset-env'),
            {
                corejs: null,
                modules: false,
                targets: {},
                useBuiltIns: false,
            },
        ]);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[1]).to.deep.equal([
            require.resolve('@babel/preset-react'),
            {
                runtime: 'automatic',
            },
        ]);
        // @ts-expect-error It's okey. It's a test
        // foo is also still there, not overridden
        expect(actualLoaders[0].options.presets[2]).to.equal('foo');
    });

    it('getLoaders() with react and callback', () => {
        const config = createConfig();
        config.enableReactPreset((options) => {
            options.development = !config.isProduction();
        });

        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // env, react & foo
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets).to.have.lengthOf(3);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[0]).to.deep.equal([
            require.resolve('@babel/preset-env'),
            {
                corejs: null,
                modules: false,
                targets: {},
                useBuiltIns: false,
            },
        ]);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[1]).to.deep.equal([
            require.resolve('@babel/preset-react'),
            {
                runtime: 'automatic',
                development: true,
            },
        ]);
        // foo is also still there, not overridden
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[2]).to.equal('foo');
    });

    it('getLoaders() with preact', () => {
        const config = createConfig();
        config.enablePreactPreset();

        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            [require.resolve('@babel/plugin-transform-react-jsx'), { pragma: 'h' }],
            'foo',
        ]);
    });

    it('getLoaders() with preact and preact-compat', () => {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            [require.resolve('@babel/plugin-transform-react-jsx')],
            'foo',
        ]);
    });

    it('getLoaders() with a callback that returns an object', () => {
        const config = createConfig();
        config.enablePreactPreset({ preactCompat: true });

        // @ts-expect-error It's okey. It's a test
        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.plugins.push('foo');

            // This should override the original config
            return { foo: true };
        });

        const actualLoaders = babelLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options).to.deep.equal({ foo: true });
    });

    it('getLoaders() with Vue and JSX support', () => {
        const config = createConfig();
        config.enableVueLoader(() => { }, {
            useJsx: true,
        });

        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.presets.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets).to.deep.include.members([
            require.resolve('@vue/babel-preset-jsx'),
            'foo',
        ]);
    });

    it('getLoaders() with configured babel env preset', () => {
        const config = createConfig();
        config.runtimeConfig.babelRcFileExists = false;

        config.configureBabel(function (config) {
            config.corejs = null;
        });

        config.configureBabelPresetEnv(function (config) {
            config.corejs = 3;
            config.include = ['bar'];
        });

        const actualLoaders = babelLoader.getLoaders(config);

        // options are overridden
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[0][1].corejs).to.equal(3);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[0][1].include).to.have.members(['bar']);
    });

    it('getLoaders() with TypeScript', () => {
        const config = createConfig();
        const presetTypeScriptOptions = { isTSX: true };

        config.enableBabelTypeScriptPreset(presetTypeScriptOptions);

        config.configureBabel(function (babelConfig) {
            // @ts-expect-error It's okey. It's a test
            babelConfig.plugins.push('foo');
        });

        const actualLoaders = babelLoader.getLoaders(config);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[0][0]).to.equal(require.resolve('@babel/preset-env'));
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[1][0]).to.equal(require.resolve('@babel/preset-typescript'));
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.presets[1][1]).to.equal(presetTypeScriptOptions);
        // @ts-expect-error It's okey. It's a test
        expect(actualLoaders[0].options.plugins).to.deep.include.members([
            'foo',
        ]);
    });

    it('getTest() base behavior', () => {
        const config = createConfig();

        const actualTest = babelLoader.getTest(config);
        expect(actualTest.toString()).to.equals(/\.(m?jsx?)$/.toString());
    });

    it('getTest() with TypeScript', () => {
        const config = createConfig();
        config.enableBabelTypeScriptPreset();

        const actualTest = babelLoader.getTest(config);
        expect(actualTest.toString()).to.equals(/\.(m?jsx?|tsx?)$/.toString());
    });
});
