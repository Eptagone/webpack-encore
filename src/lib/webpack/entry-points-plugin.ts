/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { Manifest } from 'webpack-manifest-plugin';
import copyEntryTmpName from '../utils/copyEntryTmpName.ts';

/**
 * Return the file extension from a filename, without the leading dot and without the query string (if any).
 *
 * @param filename -
 * @returns
 */
function getFileExtension(filename: string): string {
    return path.extname(filename).slice(1).split('?')[0] ?? '';
}

interface Options {
    /**
     * The public path of the assets, from where they are served
     */
    publicPath: string;
    /**
     * The output path of the assets, from where they are saved
     */
    outputPath: string;
    /**
     * The algorithms to use for the integrity hash
     */
    integrityAlgorithms: Array<string>;
}

export class EntryPointsPlugin implements WebpackPluginInstance {
    private readonly publicPath: string;
    private readonly outputPath: string;
    private readonly integrityAlgorithms: Array<string>;

    constructor(options: Options) {
        this.publicPath = options.publicPath;
        this.outputPath = options.outputPath;
        this.integrityAlgorithms = options.integrityAlgorithms;
    }

    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tapAsync({ name: 'EntryPointsPlugin' }, (compilation, callback) => {
            const manifest: Manifest = {
                entrypoints: {},
            };

            const stats = compilation.getStats().toJson({
                assets: true,
                moduleAssets: true,
                relatedAssets: false,
                chunkGroupAuxiliary: false,
                chunks: false,
                modules: false,
                timings: false,
                logging: false,
                errorDetails: false,
            });

            for (const [entryName, entry] of Object.entries(stats.entrypoints ?? {})) {
                // We don't want to include the temporary entry in the manifest
                if (entryName === copyEntryTmpName) {
                    continue;
                }

                manifest.entrypoints[entryName] = {};

                for (const asset of entry.assets ?? []) {
                    // We don't want to include hot-update files in the manifest
                    if (asset.name.includes('.hot-update.')) {
                        continue;
                    }

                    const fileExtension = getFileExtension(asset.name);
                    const assetPath = this.publicPath.slice(-1) === '/'
                        ? `${this.publicPath}${asset.name}`
                        : `${this.publicPath}/${asset.name}`;

                    if (!(fileExtension in manifest.entrypoints[entryName])) {
                        manifest.entrypoints[entryName][fileExtension] = [];
                    }
                    (manifest.entrypoints[entryName][fileExtension] as string[]).push(assetPath);
                }
            }

            if (this.integrityAlgorithms.length > 0) {
                manifest.integrity = {};

                for (const entryName in manifest.entrypoints) {
                    for (const fileType in manifest.entrypoints[entryName]) {
                        for (const asset of (manifest.entrypoints[entryName][fileType] as string[])) {
                            if (asset in manifest.integrity) {
                                continue;
                            }

                            // Drop query string if any
                            const assetNormalized = asset.includes('?') ? asset.split('?')[0] ?? '' : asset;
                            if (assetNormalized in (manifest.integrity as string[])) {
                                continue;
                            }

                            const filePath = path.resolve(
                                this.outputPath,
                                assetNormalized.replace(this.publicPath, ''),
                            );

                            if (fs.existsSync(filePath)) {
                                const fileHashes = [];

                                for (const algorithm of this.integrityAlgorithms) {
                                    const hash = crypto.createHash(algorithm);
                                    const fileContent = fs.readFileSync(filePath, 'utf8');
                                    hash.update(fileContent, 'utf8');

                                    fileHashes.push(`${algorithm}-${hash.digest('base64')}`);
                                }

                                manifest.integrity[asset] = fileHashes.join(' ');
                            }
                        }
                    }
                }
            }

            fs.writeFileSync(
                path.join(this.outputPath, 'entrypoints.json'),
                JSON.stringify(manifest, null, 2),
                { flag: 'w' },
            );

            callback();
        });
    }
}
