/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pc from 'picocolors';

interface MessagesFields {
    debug: string[];
    recommendation: string[];
    warning: string[];
    deprecation: string[];
}

interface ConfigFields {
    isVerbose: boolean;
    quiet: boolean;
}

const defaultConfig: ConfigFields & Record<string, boolean> = {
    isVerbose: false,
    quiet: false,
};

let messages: MessagesFields & Record<string, string[]> = {
    debug: [],
    recommendation: [],
    warning: [],
    deprecation: [],
};
let config: ConfigFields & Record<string, boolean> = Object.assign({}, defaultConfig);

const resetMsgs = function () {
    messages = {
        debug: [],
        recommendation: [],
        warning: [],
        deprecation: [],
    };
    config = Object.assign({}, defaultConfig);
};

function log(message: string) {
    if (config.quiet) {
        return;
    }

    console.log(message);
}

export function debug(message: string) {
    messages.debug.push(message);

    if (config.isVerbose) {
        log(`${pc.bgBlack(pc.white(' DEBUG '))} ${message}`);
    }
}

export function recommendation(message: string) {
    messages.recommendation.push(message);

    log(`${pc.bgBlue(pc.white(' RECOMMEND '))} ${message}`);
}

export function warning(message: string) {
    messages.warning.push(message);

    log(`${pc.bgYellow(pc.black(' WARNING '))} ${pc.yellow(message)}`);
}

export function deprecation(message: string) {
    messages.deprecation.push(message);

    log(`${pc.bgYellow(pc.black(' DEPRECATION '))} ${pc.yellow(message)}`);
}

export function getMessages(): Record<string, string[]> {
    return messages as unknown as Record<string, string[]>;
}

export function quiet(setQuiet = true) {
    config.quiet = setQuiet;
}

export function verbose(setVerbose = true) {
    config.isVerbose = setVerbose;
}

export function reset() {
    resetMsgs();
}
