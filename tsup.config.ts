import { execSync } from 'child_process';
import { defineConfig, type Options } from 'tsup';

const header = `/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */`;

const sharedOptions: Options = {
    clean: true,
    minify: true,
    shims: true,
    skipNodeModulesBundle: true,
};
const entrypointsOptions: Options = {
    ...sharedOptions,
    banner: {
        js: header,
    },
};

export default defineConfig([
    {
        ...entrypointsOptions,
        entry: ['src/index.mts'],
        outDir: 'dist/esm',
        format: 'esm',
        dts: true,
    },
    {
        ...entrypointsOptions,
        entry: ['src/index.cts'],
        outDir: 'dist/cjs',
        format: 'cjs',
        onSuccess: () => {
            // Emit declaration file using tsc
            execSync('tsc --emitDeclarationOnly --declaration --outFile dist/cjs/index.d.cts src/index.cts');

            return Promise.resolve();
        },
    },
    {
        ...sharedOptions,
        entry: ['src/bin/encore.ts'],
        outDir: 'dist/bin',
        banner: {
            js: '#!/usr/bin/env node',
        },
    },
]);
