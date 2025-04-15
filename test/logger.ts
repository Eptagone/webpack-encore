/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expect } from 'chai';
import context from '../src/lib/context.ts';
import * as logger from '../src/lib/logger.ts';

// @ts-expect-error runtimeCOnfig should be a class, but it's okey, it's a test
context.runtimeConfig = {};

describe('logger', () => {
    beforeEach(() => {
        logger.reset();
    });

    afterEach(() => {
        logger.reset();
    });

    it('Smoke test for log methods', () => {
        const methods = [
            'debug',
            'recommendation',
            'warning',
            'deprecation',
        ];
        const testString = 'TEST MESSAGE';
        const expectedMessages = {
            debug: [testString],
            recommendation: [testString],
            warning: [testString],
            deprecation: [testString],
        };

        logger.quiet();
        logger.verbose();

        for (const loggerMethod of methods) {
            // @ts-expect-error It's okey. It's a test
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            logger[loggerMethod](testString);
        }

        // clone the object so the afterEach doesn't clear out before
        // a failure message is shown
        const actualMessages = Object.assign({}, logger.getMessages());
        expect(actualMessages).to.deep.equal(expectedMessages);
    });

    it('test reset()', () => {
        logger.debug('DEBUG!');
        logger.reset();

        const actualMessages = Object.assign({}, logger.getMessages());

        expect(actualMessages.debug).to.have.lengthOf(0);
    });
});
