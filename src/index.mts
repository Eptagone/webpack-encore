/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type { default as Encore } from './lib/Encore.ts';
import Encore from './lib/Encore.ts';
import * as EncoreProxy from './lib/EncoreProxy.ts';

const instance = new Encore();
const encore = EncoreProxy.createProxy(instance);

/**
 * Proxy the API in order to prevent calls to most of its methods
 * if the webpackConfig object hasn't been initialized yet.
 */
export default encore;
