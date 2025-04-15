/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Encore = require('./lib/Encore.ts');
import EncoreProxy = require('./lib/EncoreProxy.ts');

const instance = new Encore.default();
const encore = EncoreProxy.createProxy(instance);

/**
 * Proxy the API in order to prevent calls to most of its methods
 * if the webpackConfig object hasn't been initialized yet.
 */
export = encore;
