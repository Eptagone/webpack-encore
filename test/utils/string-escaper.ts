/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import stringEscaper from '../../src/lib/utils/string-escaper.ts';

function expectEvaledStringToEqual(str: string, expectedStr: string) {
    // put the string in quotes & eval it: should match original
    expect(eval(`'${str}'`)).to.equal(expectedStr);
}

describe('string-escaper', () => {
    it('escapes filenames with quotes', () => {
        const filename = '/foo/bar\'s/stuff';

        const escapedFilename = stringEscaper(filename);
        expectEvaledStringToEqual(escapedFilename, filename);
    });

    it('escapes Windows filenames', () => {
        const filename = `C:\\path\\to\\file`;

        const escapedFilename = stringEscaper(filename);
        expectEvaledStringToEqual(escapedFilename, filename);
    });
});
