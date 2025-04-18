/*
* This file is part of the Symfony Webpack Encore package.
*
* (c) Fabien Potencier <fabien@symfony.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import process from 'process';
import stripAnsi from 'strip-ansi';
import { fileURLToPath } from 'url';
import * as packageHelper from '../src/lib/package-helper.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('package-helper', () => {
    const baseCwd = process.cwd();

    describe('recommended install command is based on the existing lock files', () => {
        after(() => {
            process.chdir(baseCwd);
        });

        it('missing packages without any lock file', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/empty'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' },
            ])!;
            expect(packageRecommendations.installCommand).to.contain('npm install foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with package-lock.json only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' },
            ])!;
            expect(packageRecommendations.installCommand).to.contain('npm install foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with yarn.lock only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' },
            ])!;
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with pnpm-lock.yaml only', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/pnpm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' },
            ])!;
            expect(packageRecommendations.installCommand).to.contain('pnpm add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with both package-lock.json and yarn.lock', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn-npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' },
            ])!;
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with package-lock.json, yarn.lock and pnpm-lock.yaml', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/pnpm-yarn-npm'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'webpack' }, { name: 'bar' },
            ])!;
            expect(packageRecommendations.installCommand).to.contain('pnpm add foo bar');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar');
        });

        it('missing packages with alternative packages', () => {
            process.chdir(path.join(__dirname, '../fixtures/package-helper/yarn'));
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' },
                [{ name: 'bar' }, { name: 'baz' }],
                [{ name: 'qux' }, { name: 'corge' }, { name: 'grault' }],
                [{ name: 'quux' }, { name: 'webpack' }],
            ])!;
            expect(packageRecommendations.installCommand).to.contain('yarn add foo bar qux');
            expect(stripAnsi(packageRecommendations.message)).to.contain('foo & bar (or baz) & qux (or corge or grault)');
        });
    });

    describe('check messaging on install commands', () => {
        it('Make sure the major version is included in the install command', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo' }, { name: 'bar', version: '^3.0' },
            ])!;

            expect(packageRecommendations.installCommand).to.contain('pnpm add foo bar@^3.0');
        });

        it('Recommends correct install on 0 version', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^0.1.0' },
                { name: 'bar' },
            ])!;

            expect(packageRecommendations.installCommand).to.contain('pnpm add foo@^0.1.0 bar');
        });

        it('Recommends correct install with a more complex constraint', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0||^8.0' },
                { name: 'bar' },
            ])!;

            expect(packageRecommendations.installCommand).to.contain('pnpm add foo@^8.0 bar');
        });

        it('Recommends correct install with a more complex constraint', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0 || ^8.0' },
                { name: 'bar' },
            ])!;

            expect(packageRecommendations.installCommand).to.contain('pnpm add foo@^8.0 bar');
        });

        it('Recommends correct install with alternative packages', () => {
            const packageRecommendations = packageHelper.getMissingPackageRecommendations([
                { name: 'foo', version: '^7.0 || ^8.0' },
                [{ name: 'bar' }, { name: 'baz' }],
                [{ name: 'qux', version: '^1.0' }, { name: 'quux', version: '^2.0' }],
            ])!;

            expect(packageRecommendations.installCommand).to.contain('pnpm add foo@^8.0 bar qux@^1.0');
        });
    });

    describe('The getInvalidPackageVersionRecommendations correctly checks installed versions', () => {
        it('Check package that *is* the correct version', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: '@hotwired/stimulus', version: '^3.0.0' },
                { name: 'preact', version: '^8.2.0 || ^10.0.0' },
            ]);

            expect(versionProblems).to.be.empty;
        });

        it('Check package with a version too low', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: '@hotwired/stimulus', version: '^4.0.0' },
                { name: 'preact', version: '9.0.0' },
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too old');
        });

        it('Check package with a version too new', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: '@hotwired/stimulus', version: '^2.0' },
                { name: 'preact', version: '8.1.0' },
            ]);

            expect(versionProblems).to.have.length(2);
            expect(versionProblems[0]).to.contain('is too new');
        });

        it('Missing "version" key is ok', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'sass-loader', version: '^6.9.9' },
                { name: 'preact' },
            ]);

            // just sass-loader
            expect(versionProblems).to.have.length(1);
        });

        it('Beta version is ok', () => {
            const versionProblems = packageHelper.getInvalidPackageVersionRecommendations([
                { name: 'vue', version: '^3.0.0-beta.5' },
            ]);

            expect(versionProblems).to.be.empty;
        });
    });

    describe('addPackagesVersionConstraint', () => {
        it('Lookup a version constraint', () => {
            const inputPackages = [
                { name: 'sass-loader', enforce_version: 7 },
                { name: 'node-sass' },
                { name: 'vue', version: '^2' },
            ];

            const packageInfo = JSON.parse(
                fs.readFileSync(path.join(__dirname, '../package.json'), { encoding: 'utf8' }),
            );

            const expectedPackages: Array<packageHelper.PackageConfiguration> = [
                { name: 'sass-loader', version: packageInfo.devDependencies['sass-loader'] },
                { name: 'node-sass' },
                { name: 'vue', version: '^2' },
            ];

            const actualPackages = packageHelper.addPackagesVersionConstraint(inputPackages);
            expect(JSON.stringify(actualPackages)).to.equal(JSON.stringify(expectedPackages));
        });
    });
});
