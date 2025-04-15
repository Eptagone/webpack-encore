/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import path, { resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';
import packageUp from '../../src/lib/utils/package-up.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('package-up', () => {
    const test = {
        'package.json from Encore': {
            cwd: __dirname,
            expectedPath: resolvePath(__dirname, '../../package.json'),
        },
        'package.json from a subdirectory': {
            cwd: resolvePath(__dirname, '../../fixtures/stimulus/mock-module'),
            expectedPath: resolvePath(__dirname, '../../fixtures/stimulus/mock-module/package.json'),
        },
        'package.json from Encore when no package.json exists in the current directory': {
            cwd: resolvePath(__dirname, '../../fixtures'),
            expectedPath: resolvePath(__dirname, '../../package.json'),
        },
        'package.json from Encore when no package.json exists in the current directory (subdirectory)': {
            cwd: resolvePath(__dirname, '../../fixtures/copy'),
            expectedPath: resolvePath(__dirname, '../../package.json'),
        },
    };

    Object.entries(test).forEach(([description, { cwd, expectedPath }]) => {
        it(description, () => {
            expect(expectedPath).to.be.a('string');

            const path = packageUp({ cwd });

            expect(path).to.equal(expectedPath);
        });
    });
});
