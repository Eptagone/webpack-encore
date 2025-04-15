/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fs from 'fs-extra';
import type http from 'http';
import httpServer from 'http-server';
import type https from 'https';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import type yargsParser from 'yargs-parser';
import WebpackConfig from '../../src/lib/WebpackConfig.ts';
import configGenerator from '../../src/lib/config-generator.ts';
import parseRuntime from '../../src/lib/config/parse-runtime.ts';
import validator from '../../src/lib/config/validator.ts';
import assertUtil, { type Assert } from './assert.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const tmpDir = path.join(__dirname, '../', '../', 'test_tmp');
const testFixturesDir = path.join(__dirname, '../', '../', 'fixtures');

let servers: Array<http.Server | https.Server> = [];

export function createTestAppDir(rootDir: string | null = null, subDir: string | null = null) {
    const testAppDir = path.join(rootDir ? rootDir : tmpDir, subDir ? subDir : Math.random().toString(36).substring(7));

    // copy the fixtures into this new directory
    fs.copySync(testFixturesDir, testAppDir);

    return testAppDir;
}

/**
 * @param testAppDir - The dir from calling createTestAppDir()
 * @param outputDirName -
 * @param command - The encore command name (e.g. dev)
 * @param argv - Additional argv commands
 * @returns
 */
export function createWebpackConfig(
    testAppDir: string,
    outputDirName: string = '',
    command: string,
    argv: Record<string, unknown> = {},
): WebpackConfig & { outputPath: string } {
    argv._ = [command];
    argv.context = testAppDir;
    const runtimeConfig = parseRuntime(
        argv as yargsParser.Arguments,
        testAppDir,
    );

    const config = new WebpackConfig(runtimeConfig);

    const outputPath = path.join(testAppDir, outputDirName);
    // allows us to create a few levels deep without issues
    fs.mkdirsSync(outputPath);
    config.setOutputPath(outputPath);

    return config as WebpackConfig & { outputPath: string };
}

export function runWebpack(
    webpackConfig: WebpackConfig,
    callback: (assert: Assert, stats: webpack.Stats | undefined, content: string) => void,
    allowCompilationError = false,
) {
    const stdoutWrite = process.stdout.write.bind(process.stdout);
    const stdOutContents: Array<string | Uint8Array<ArrayBufferLike>> = [];

    try {
        // Mute stdout
        process.stdout.write = (message) => {
            stdOutContents.push(message);
            return true;
        };

        validator(webpackConfig);

        const compiler = webpack(configGenerator(webpackConfig));
        compiler.run((err, stats) => {
            // Restore stdout
            process.stdout.write = stdoutWrite;

            if (err) {
                console.error(err.stack || err);
                if ('details' in err && err.details) {
                    console.error(err.details);
                }

                throw new Error('Error running webpack!');
            }

            const info = stats?.toJson();

            if (stats?.hasErrors() && !allowCompilationError) {
                console.error(info?.errors);

                throw new Error('Compilation error running webpack!');
            }

            if (stats?.hasWarnings()) {
                console.warn(info?.warnings);
            }

            callback(assertUtil(webpackConfig), stats, stdOutContents.join('\n'));
        });
    }
    catch (e) {
        // Restore stdout and then re-throw the exception
        process.stdout.write = stdoutWrite;
        throw e;
    }
}

export function emptyTmpDir() {
    fs.emptyDirSync(tmpDir);
}

export function touchFileInOutputDir(filename: string, webpackConfig: WebpackConfig & { outputPath: string }) {
    const fullPath = path.join(webpackConfig.outputPath, filename);
    fs.ensureDirSync(path.dirname(fullPath));

    fs.writeFileSync(
        fullPath,
        '',
    );
}

function startHttpServer(port: number, webRoot: string) {
    const server = httpServer.createServer({
        root: webRoot,
    });

    server.listen(port, '0.0.0.0');
    servers.push(server);
}

function stopAllServers() {
    for (const server of servers) {
        server.close();
    }

    servers = [];
}

/**
 * Creates a testing.html file with specified script and link tags,
 * makes a request to it, and executes a callback, passing that
 * the Browser instance used to make the request.
 *
 * @param browser - Puppeteer browser instance
 * @param webRootDir - Directory path (e.g. /path/to/public) where the web server should be rooted
 * @param scriptSrcs -  Used to create <script src=""> tags.
 * @param callback - Called after the page was requested.
 * @returns
 */
export async function requestTestPage(browser: import('puppeteer').Browser, webRootDir: string, scriptSrcs: string[], callback: (arg0: {
    page: import('puppeteer').Page;
    loadedResources: Array<{ response: import('puppeteer').HTTPResponse }>;
}) => void): Promise<void> {
    let scripts = '';
    for (const scriptSrc of scriptSrcs) {
        scripts += `<script src="${scriptSrc}"></script>`;
    }

    const testHtml = `<!DOCTYPE html>
<html>
<head>
</head>
<body>
    <div id="app"></div>
    ${scripts}
</body>
</html>
`;

    // write the testing.html file
    fs.writeFileSync(
        path.join(webRootDir, 'testing.html'),
        testHtml,
    );

    // start the main local server
    startHttpServer(8080, webRootDir);
    // start a secondary server - can be used as the "CDN"
    startHttpServer(8090, webRootDir);

    const loadedResources: Array<{ response: import('puppeteer').HTTPResponse }> = [];

    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    page.on('error', (error) => {
        // @ts-expect-error Error only has a single parameter
        throw new Error(`Error when running the browser: "${error.message}".`, { cause: error });
    });

    page.on('requestfailed', (request) => {
        throw new Error(`Error "${request.failure()?.errorText}" when requesting resource "${request.url()}".`);
    });

    page.on('response', (response) => {
        loadedResources.push({
            response,
        });
    });

    await page.goto('http://127.0.0.1:8080/testing.html', {
        waitUntil: 'networkidle0',
    });
    stopAllServers();
    callback({ page, loadedResources });
    await page.close();
}
