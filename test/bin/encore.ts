/* eslint-disable @typescript-eslint/no-unused-expressions */
/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as chai from 'chai';
import chaiFs from 'chai-fs';
import { exec, execSync, spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import * as testSetup from '../helpers/setup.ts';

const expect = chai.expect;
chai.use(chaiFs);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '../', '../');

describe('dist/bin/encore.cjs', function () {
    // being functional tests, these can take quite long
    this.timeout(10000);

    it('Basic smoke test', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`,
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `,
        );

        const binPath = path.resolve(__dirname, '../', '../', 'dist', 'bin', 'encore.cjs');
        exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err.message} ${stderr} ${stdout}`);
            }

            expect(stdout).to.contain('Compiled successfully');

            expect(stdout).not.to.contain('Hash: ');
            expect(stdout).not.to.contain('Version: ');
            expect(stdout).not.to.contain('Time: ');

            done();
        });
    });

    it('Smoke test using the --json option', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `,
        );

        const binPath = path.resolve(__dirname, '../', '../', 'dist', 'bin', 'encore.cjs');
        exec(`node ${binPath} dev --json --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err.message} ${stderr} ${stdout}`);
            }

            let parsedOutput = null;
            try {
                parsedOutput = JSON.parse(stdout);
            }
            catch (_) {
                throw new Error(`Webpack output does not contain a valid JSON object: ${stdout}`);
            }

            expect(parsedOutput).to.be.an('object');
            expect(parsedOutput.modules).to.be.an('array');

            // We expect 4 modules there:
            // - webpack/runtime/chunk loaded
            // - webpack/runtime/jsonp chunk loading
            // - webpack/runtime/hasOwnProperty shorthand
            // - ./js/no_require.js
            expect(parsedOutput.modules.length).to.equal(4);

            done();
        });
    });

    it('Smoke test using the --profile option', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `,
        );

        const binPath = path.resolve(__dirname, '../', '../', 'dist', 'bin', 'encore.cjs');
        exec(`node ${binPath} dev --profile --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err.message} ${stderr} ${stdout}`);
            }

            expect(stdout).to.contain('resolving: ');
            expect(stdout).to.contain('restoring: ');
            expect(stdout).to.contain('integration: ');
            expect(stdout).to.contain('building: ');

            done();
        });
    });

    it('Smoke test using the --keep-public-path option', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `,
        );

        const binPath = path.resolve(__dirname, '../', '../', 'dist', 'bin', 'encore.cjs');
        exec(`node ${binPath} dev --keep-public-path --context=${testDir}`, { cwd: testDir }, (err, stdout, stderr) => {
            if (err) {
                throw new Error(`Error executing encore: ${err.message} ${stderr} ${stdout}`);
            }

            done();
        });
    });

    it('Display an error when calling an unknown method', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`,
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .enableSingleRuntimeChuck()
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `,
        );

        const binPath = path.resolve(__dirname, '../', '../', 'dist', 'bin', 'encore.cjs');
        exec(`node ${binPath} dev --context=${testDir}`, { cwd: testDir }, (err, stdout, _stderr) => {
            expect(err).not.to.be.null;
            expect(stdout).to.contain('is not a recognized property');
            expect(stdout).to.contain('or method');
            expect(stdout).to.contain('Did you mean');
            done();
        });
    });

    it('Run the webpack-dev-server successfully', (done) => {
        testSetup.emptyTmpDir();
        const testDir = testSetup.createTestAppDir();

        fs.writeFileSync(
            path.join(testDir, 'package.json'),
            `{
                "devDependencies": {
                    "@symfony/webpack-encore": "*"
                }
            }`,
        );

        fs.writeFileSync(
            path.join(testDir, 'webpack.config.js'),
            `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
            `,
        );

        const binPath = path.resolve(__dirname, '../', '../', 'dist', 'bin', 'encore.cjs');
        const abortController = new AbortController();
        const node = spawn('node', [binPath, 'dev-server', `--context=${testDir}`], {
            cwd: testDir,
            env: Object.assign({}, process.env, { NO_COLOR: 'true' }),
            signal: abortController.signal,
        });

        let stdout = '';
        let stderr = '';

        node.stdout.on('data', (data: { toString: () => string }) => {
            stdout += data.toString();
        });

        node.stderr.on('data', (data: { toString: () => string }) => {
            stderr += data.toString();
        });

        node.on('error', (error) => {
            if (error.name !== 'AbortError') {
                // @ts-expect-error Error only has a single parameter
                throw new Error('Error executing encore', { cause: error });
            }

            expect(stdout).to.contain('Running webpack-dev-server ...');
            expect(stdout).to.contain('Compiled successfully in');
            expect(stdout).to.contain('webpack compiled successfully');

            expect(stderr).to.contain('[webpack-dev-server] Project is running at:');
            expect(stderr).to.contain('[webpack-dev-server] Loopback: http://localhost:8080/');
            expect(stderr).to.contain('[webpack-dev-server] Content not from webpack is served from');

            done();
        });

        setTimeout(() => {
            abortController.abort();
        }, 5000);
    });

    describe('Without webpack-dev-server installed', () => {
        before(() => {
            execSync('pnpm remove webpack-dev-server', { cwd: projectDir });
        });

        after(() => {
            // Re-install webpack-dev-server and ensure the project is in a clean state
            execSync('git checkout package.json', { cwd: projectDir });
            execSync('pnpm install', { cwd: projectDir });
        });

        it('Throw an error when trying to use the webpack-dev-server if not installed', (done) => {
            testSetup.emptyTmpDir();
            const testDir = testSetup.createTestAppDir();

            fs.writeFileSync(
                path.join(testDir, 'package.json'),
                `{
                    "devDependencies": {
                        "@symfony/webpack-encore": "*"
                    }
                }`,
            );

            fs.writeFileSync(
                path.join(testDir, 'webpack.config.js'),
                `
const Encore = require('../../index.js');
Encore
    .enableSingleRuntimeChunk()
    .setOutputPath('build/')
    .setPublicPath('/build')
    .addEntry('main', './js/no_require')
;

module.exports = Encore.getWebpackConfig();
        `,
            );

            const binPath = path.resolve(projectDir, 'dist', 'bin', 'encore.cjs');
            exec(
                `node ${binPath} dev-server --context=${testDir}`,
                {
                    cwd: testDir,
                    env: Object.assign({}, process.env, { NO_COLOR: 'true' }),
                },
                (_err, stdout, stderr) => {
                    expect(stdout).to.contain('Install webpack-dev-server to use the webpack Development Server');
                    expect(stdout).to.contain('npm install webpack-dev-server --save-dev');
                    expect(stderr).to.equal('');

                    expect(stdout).not.to.contain('Running webpack-dev-server ...');
                    expect(stdout).not.to.contain('Compiled successfully in');
                    expect(stdout).not.to.contain('webpack compiled successfully');

                    done();
                });
        });
    });
});
