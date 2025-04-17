/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as chai from 'chai';
import fs from 'fs';
import path from 'path';
import regexEscaper from '../../src/lib/utils/regexp-escaper.ts';
import type WebpackConfig from '../../src/lib/WebpackConfig.ts';
import type { ValidatedWebpackConfig } from '../../src/lib/WebpackConfig.ts';
const expect = chai.expect;

const loadManifest = function (webpackConfig: ValidatedWebpackConfig | (WebpackConfig & { outputPath: string })) {
    return JSON.parse(
        fs.readFileSync(path.join(webpackConfig.outputPath, 'manifest.json'), 'utf8'),
    ) as Record<string, string>;
};

const readOutputFile = function (webpackConfig: ValidatedWebpackConfig | (WebpackConfig & { outputPath: string }), filePath: string) {
    const fullPath = path.join(webpackConfig.outputPath, filePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Output file "${filePath}" does not exist.`);
    }

    return fs.readFileSync(fullPath, 'utf8');
};

const getMatchedFilename = function (targetDirectory: string, filenameRegex: RegExp): string | false {
    const actualFiles = fs.readdirSync(targetDirectory);
    let foundFile: string | false = false;
    actualFiles.forEach((actualFile) => {
        // filter out directories
        if (fs.statSync(path.join(targetDirectory, actualFile)).isDirectory()) {
            return;
        }

        if (actualFile.match(filenameRegex)) {
            foundFile = actualFile;
        }
    });

    return foundFile;
};

/**
 * Returns a regex to use to match this filename
 *
 * @param filename - Filename with possible [hash:8] wildcard
 * @returns
 */
const convertFilenameToMatcher = function (filename: string): RegExp {
    const hashMatch = filename.match(/\[hash:(\d+)\]/);

    if (hashMatch === null) {
        return new RegExp(regexEscaper(filename));
    }

    const [hashString, hashLength] = hashMatch;

    return new RegExp(
        regexEscaper(filename)
            .replace(regexEscaper(hashString), `([a-z0-9_-]){${hashLength}}`),
    );
};

class Assert {
    constructor(private readonly webpackConfig: ValidatedWebpackConfig | (WebpackConfig & { outputPath: string })) { }

    assertOutputFileContains(filePath: string, expectedContents: string) {
        const actualFilename = getMatchedFilename(
            this.webpackConfig.outputPath,
            convertFilenameToMatcher(filePath),
        );

        if (false === actualFilename) {
            throw new Error(`Output file "${filePath}" does not exist.`);
        }

        const fullPath = path.join(this.webpackConfig.outputPath, actualFilename);

        const actualContents = fs.readFileSync(fullPath, 'utf8');
        if (!actualContents.includes(expectedContents)) {
            throw new Error(`Expected contents "${expectedContents}" not found in file ${fullPath}`);
        }
    }

    assertOutputFileDoesNotExist(filePath: string) {
        const fullPath = path.join(this.webpackConfig.outputPath, filePath);

        if (fs.existsSync(fullPath)) {
            throw new Error(`Output file "${filePath}" exist but should not!`);
        }
    }

    assertOutputFileDoesNotContain(filePath: string, expectedContents: string) {
        const fullPath = path.join(this.webpackConfig.outputPath, filePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`Output file "${filePath}" does not exist.`);
        }

        const actualContents = fs.readFileSync(fullPath, 'utf8');
        if (actualContents.includes(expectedContents)) {
            throw new Error(`Contents "${expectedContents}" *were* found in file ${fullPath}, but should not have been.`);
        }
    }

    assertOutputFileHasSourcemap(filePath: string) {
        const actualContents = readOutputFile(this.webpackConfig, filePath);

        const hasSourceMappingUrl = actualContents.includes('sourceMappingURL');
        const hasSourceUrl = actualContents.includes('sourceURL');

        if (!hasSourceMappingUrl && !hasSourceUrl) {
            throw new Error(`No sourcemap found for ${filePath}!`);
        }

        if (hasSourceMappingUrl) {
            const sourceMappingUrlContents = actualContents.split('sourceMappingURL')[1];

            // if you set config.devtool = '#inline-source-map', but then
            // incorrectly configure css/sass sourcemaps, you WILL have
            // a sourcemap, but it will be too small / i.e. basically empty
            if (!sourceMappingUrlContents || sourceMappingUrlContents.length < 200) {
                throw new Error(`Sourcemap for ${filePath} appears to be empty!`);
            }
        }
    }

    assertOutputFileDoesNotHaveSourcemap(filePath: string) {
        const actualContents = readOutputFile(this.webpackConfig, filePath);

        if (actualContents.includes('sourceMappingURL') || actualContents.includes('sourceURL')) {
            throw new Error(`Sourcemap found for ${filePath}!`);
        }
    }

    assertManifestPath(sourcePath: string, expectedDestinationPath: string) {
        const manifestData = loadManifest(this.webpackConfig);

        this.assertManifestKeyExists(sourcePath);

        const expectedRegex = convertFilenameToMatcher(expectedDestinationPath);

        if (!manifestData[sourcePath]?.match(expectedRegex)) {
            throw new Error(`source path ${sourcePath} expected to match pattern ${expectedDestinationPath}, was actually ${manifestData[sourcePath]}`);
        }
    }

    assertManifestKeyExists(key: string) {
        const manifestData = loadManifest(this.webpackConfig);

        if (!manifestData[key]) {
            throw new Error(`No ${key} key found in manifest ${JSON.stringify(manifestData)}`);
        }
    }

    assertManifestPathDoesNotExist(sourcePath: string) {
        const manifestData = loadManifest(this.webpackConfig);

        if (manifestData[sourcePath]) {
            throw new Error(`Source ${sourcePath} key WAS found in manifest, but should not be there!`);
        }
    }

    /**
     * @param loadedResources -
     * @param expectedResourcePaths - Array of expected resources, but just
     *                  their short filenames - e.g. main.css
     *                  (i.e. without the public path)
     */
    assertResourcesLoadedCorrectly(loadedResources: Array<{ response: import('puppeteer').HTTPResponse }>, expectedResourcePaths: string[]): void {
        const actualResources = [];

        for (const resource of loadedResources) {
            const url = resource.response.url();

            // skip the .html page as a resource
            if (url.includes('testing.html')) {
                continue;
            }

            // skip the favicon as a resource
            if (url.includes('favicon.ico')) {
                continue;
            }

            actualResources.push(url);
        }

        // prefix each expected resource with its public path
        // needed when the public path is a CDN
        const expectedResources = expectedResourcePaths.map((path) => {
            // if we've explicitly passed a full URL in for testing, ignore that
            if (path.startsWith('http://')) {
                return path;
            }

            return this.webpackConfig.getRealPublicPath() + path;
        });

        expect(actualResources).to.have.all.members(expectedResources);
    }

    assertOutputJsonFileMatches(sourcePath: string, expectedData: unknown) {
        const actualContents = readOutputFile(this.webpackConfig, sourcePath);

        const actualData = JSON.parse(actualContents);

        expect(JSON.stringify(actualData, null, 2)).to.equal(JSON.stringify(expectedData, null, 2));
    }

    /**
     * Verifies that the directory contains the array of files.
     *
     * The expectedFiles can contain a [hash:8] syntax in case
     * the file is versioned - e.g. main.[hash:8].js, which would
     * match a real file like main.abcd1234.js.
     *
     * @param expectedFiles -
     * @param directory - directory relative to output to check
     */
    assertDirectoryContents(expectedFiles: string[], directory: string = ''): void {
        const targetDirectory = path.join(this.webpackConfig.outputPath, directory);

        expect(targetDirectory).to.be.a.directory();

        const expectedFileStrings: Record<string, RegExp> = {};
        expectedFiles.forEach((expectedFile) => {
            expectedFileStrings[expectedFile] = convertFilenameToMatcher(expectedFile);
        });

        const actualFiles = fs.readdirSync(targetDirectory);
        actualFiles.forEach((foundFile) => {
            // filter out directories
            if (fs.statSync(path.join(targetDirectory, foundFile)).isDirectory()) {
                return;
            }

            let matchIsFound = false;

            for (const originalFilename of Object.keys(expectedFileStrings)) {
                const filenameRegex = expectedFileStrings[originalFilename];

                if (filenameRegex && foundFile.match(filenameRegex)) {
                    matchIsFound = true;
                    delete expectedFileStrings[originalFilename];

                    break;
                }
            }

            if (!matchIsFound) {
                throw new Error(`File "${foundFile}" was found in directory but was not expected. Expected patterns where ${expectedFiles.join(', ')}`);
            }
        });

        if (Object.keys(expectedFileStrings).length > 0) {
            throw new Error(`Files ${Object.keys(expectedFileStrings).join(', ')} were expected to be found in the directory but were not. Actual files: ${actualFiles.join(', ')}`);
        }
    }
}

export type { Assert };
export default function (webpackConfig: ValidatedWebpackConfig | (WebpackConfig & { outputPath: string })) {
    return new Assert(webpackConfig);
};
