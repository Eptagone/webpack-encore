/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class RuntimeConfig {
    public command: string | null | undefined = null;
    public context: string | null = null;
    public isValidCommand: boolean = false;
    public environment: string = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
    public useDevServer: boolean = false;
    public devServerHttps: boolean | null = null;

    // see config-generator - getWebpackConfig()
    public devServerFinalIsHttps: boolean | null = null;
    public devServerHost: string | null = null;
    public devServerPort: number | null = null;
    public devServerPublic: string | null | false = null;
    public devServerKeepPublicPath: boolean = false;
    public outputJson: boolean = false;
    public profile: boolean = false;

    public babelRcFileExists: boolean | null = null;

    public helpRequested: boolean = false;
    public verbose: boolean = false;
}

export default RuntimeConfig;
