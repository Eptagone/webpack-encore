/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import regexpEscaper from '../../src/lib/utils/regexp-escaper.ts';

describe('regexp-escaper', () => {
    it('escapes things properly', () => {
        expect(regexpEscaper('.*')).to.equal('\\.\\*');
        expect(regexpEscaper('[foo]')).to.equal('\\[foo\\]');
        expect(regexpEscaper('(foo|bar)')).to.equal('\\(foo\\|bar\\)');
        expect(regexpEscaper('foo{2}')).to.equal('foo\\{2\\}');
        expect(regexpEscaper('\\foo\\')).to.equal('\\\\foo\\\\');
        expect(regexpEscaper('^foo$')).to.equal('\\^foo\\$');
        expect(regexpEscaper('foo?')).to.equal('foo\\?');
        expect(regexpEscaper('foo+')).to.equal('foo\\+');
    });
});
