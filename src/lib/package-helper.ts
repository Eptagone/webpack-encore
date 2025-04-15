/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs';
import { createRequire } from 'module';
import pc from 'picocolors';
import semver from 'semver';
import packageJsonData from '../../package.json' with { type: 'json' };
import * as logger from './logger.ts';

export interface PackageData {
    name: string;
    version?: string;
}

export interface PackageConfiguration extends PackageData {
    enforce_version?: true;
}

const require = createRequire(import.meta.url);

export function ensurePackagesExist(packagesConfig: Array<PackageData | PackageData[]>, requestedFeature: string) {
    const missingPackagesRecommendation = getMissingPackageRecommendations(packagesConfig, requestedFeature);

    if (missingPackagesRecommendation) {
        throw new Error(`
${missingPackagesRecommendation.message}
  ${missingPackagesRecommendation.installCommand}
`);
    }

    // check for invalid versions & warn
    const invalidVersionRecommendations = getInvalidPackageVersionRecommendations(packagesConfig);
    for (const message of invalidVersionRecommendations) {
        logger.warning(message);
    }
}

export function getInstallCommand(packageConfigs: PackageData[][]) {
    const hasPnpmLockfile = fs.existsSync('pnpm-lock.yaml');
    const hasYarnLockfile = fs.existsSync('yarn.lock');
    const packageInstallStrings = packageConfigs.map((packageConfig) => {
        const firstPackage = packageConfig[0];

        if (!firstPackage) {
            throw new Error('Empty packageConfig passed to getInstallCommand().');
        }

        if (typeof firstPackage.version === 'undefined') {
            return firstPackage.name;
        }

        // e.g. ^4.0||^5.0: use the latest version
        let recommendedVersion = firstPackage.version;
        if (recommendedVersion.includes('||')) {
            recommendedVersion = recommendedVersion.split('|').pop()!.trim();
        }

        // recommend the version included in our package.json file
        return `${firstPackage.name}@${recommendedVersion}`;
    });

    if (hasPnpmLockfile) {
        return pc.yellow(`pnpm add ${packageInstallStrings.join(' ')} --save-dev`);
    }

    if (hasYarnLockfile) {
        return pc.yellow(`yarn add ${packageInstallStrings.join(' ')} --dev`);
    }

    return pc.yellow(`npm install ${packageInstallStrings.join(' ')} --save-dev`);
}

function isPackageInstalled(packageConfig: { name: string }) {
    try {
        require.resolve(packageConfig.name);
        return true;
    }
    catch (_) {
        return false;
    }
}

export function getPackageVersion(packageName: string): string | null {
    try {
        return require(`${packageName}/package.json`).version;
    }
    catch (_) {
        return null;
    }
}

export function getMissingPackageRecommendations(packagesConfig: Array<PackageData | PackageData[]>, requestedFeature: string | null = null) {
    const missingPackageConfigs = [];

    for (let packageConfig of packagesConfig) {
        if (!Array.isArray(packageConfig)) {
            packageConfig = [packageConfig];
        }

        if (!packageConfig.some(isPackageInstalled)) {
            missingPackageConfigs.push(packageConfig);
        }
    }

    if (missingPackageConfigs.length === 0) {
        return;
    }

    const missingPackageNamesPicocolorsed = missingPackageConfigs.map(function (packageConfigs) {
        const packageNames = packageConfigs.map((packageConfig) => {
            return pc.green(packageConfig.name);
        });

        let missingPackages = packageNames[0];
        if (packageNames.length > 1) {
            const alternativePackages = packageNames.slice(1);
            missingPackages = `${missingPackages} (or ${alternativePackages.join(' or ')})`;
        }

        return missingPackages;
    });

    let message = `Install ${missingPackageNamesPicocolorsed.join(' & ')}`;
    if (requestedFeature) {
        message += ` to use ${pc.green(requestedFeature)}`;
    }

    const installCommand = getInstallCommand(missingPackageConfigs);

    return {
        message,
        installCommand,
    };
}

export function getInvalidPackageVersionRecommendations(packagesConfig: Array<PackageData | PackageData[]>): string[] {
    const processPackagesConfig = (packageConfig: PackageData | PackageData[]) => {
        if (Array.isArray(packageConfig)) {
            let messages: string[] = [];

            for (const config of packageConfig) {
                messages = messages.concat(processPackagesConfig(config));
            }

            return messages;
        }

        if (typeof packageConfig.version === 'undefined') {
            return [];
        }

        const version = getPackageVersion(packageConfig.name);

        // If version is null at this point it should be because
        // of an optional dependency whose presence has already
        // been checked before.
        if (version === null) {
            return [];
        }

        if (semver.satisfies(version, packageConfig.version)) {
            return [];
        }

        if (semver.gtr(version, packageConfig.version)) {
            return [
                `Webpack Encore requires version ${pc.green(packageConfig.version)} of ${pc.green(packageConfig.name)}. Your version ${pc.green(version)} is too new. The related feature *may* still work properly. If you have issues, try downgrading the library, or upgrading Encore.`,
            ];
        }
        else {
            return [
                `Webpack Encore requires version ${pc.green(packageConfig.version)} of ${pc.green(packageConfig.name)}, but your version (${pc.green(version)}) is too old. The related feature will probably *not* work correctly.`,
            ];
        }
    };

    return packagesConfig.flatMap(processPackagesConfig);
}

export function addPackagesVersionConstraint(packages: Array<PackageData | PackageData[]>): Array<PackageData | PackageData[]> {
    function addConstraint(packageData: PackageConfiguration): PackageData;
    function addConstraint(packageData: PackageConfiguration[]): PackageData[];
    function addConstraint(packageData: PackageConfiguration | PackageConfiguration[]): PackageData | PackageData[];
    function addConstraint(packageData: PackageConfiguration | PackageConfiguration[]) {
        if (Array.isArray(packageData)) {
            return packageData.map(addConstraint);
        }

        const newData: PackageConfiguration & PackageData = Object.assign({}, packageData);

        if (packageData.enforce_version) {
            const devDependencies: Record<string, string> = packageJsonData.devDependencies;
            const version = devDependencies[packageData.name];

            // this method only supports devDependencies due to how it's used:
            // it's mean to inform the user what deps they need to install
            // for optional features
            if (!version) {
                throw new Error(`Could not find package ${packageData.name}`);
            }

            newData.version = version;
            delete newData['enforce_version'];
        }

        return newData;
    };

    return packages.map(addConstraint);
}
