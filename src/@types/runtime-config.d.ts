import type RuntimeConfig from '../lib/config/RuntimeConfig.ts';

// extend the globalThis scope of NodeJS
declare global {
    // eslint-disable-next-line no-var
    var WEBPACK_ENCORE_RUNTIME_CONFIG: RuntimeConfig | null | undefined;
}
