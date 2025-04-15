/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import nodePlugin from 'eslint-plugin-n';
import tsdoc from 'eslint-plugin-tsdoc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    nodePlugin.configs['flat/recommended'],
    jsdoc.configs['flat/contents-typescript'],
    jsdoc.configs['flat/logical-typescript'],
    {
        plugins: {
            tsdoc,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: process.cwd(),
            },
            globals: {
                ...globals.node,
            },
        },
    },
    stylistic.configs.customize({
        flat: true,
        indent: 4,
        quotes: 'single',
        semi: true,
    }),
    {
        rules: {
            'no-extra-bind': 'warn',
            'eqeqeq': 'error',
            'tsdoc/syntax': 'warn',
            'tjsdoc/text-escaping': 'off',
            'no-case-declarations': 'off',
            'jsdoc/check-tag-names': 'off',
            'jsdoc/match-description': 'off',
            'jsdoc/informative-docs': 'off',
            'jsdoc/text-escaping': 'off',
            'n/no-process-exit': 'warn',
            'n/no-missing-import': 'off', // TypeScript handles this
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/prefer-find': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-empty-object-type': 'warn',
            '@typescript-eslint/no-require-imports': ['error', { allow: ['\\.cjs$', '\\.cts$'] }],
            '@stylistic/type-annotation-spacing': 'warn',
            '@stylistic/space-infix-ops': 'warn',
            '@stylistic/space-in-parens': 'error',
            '@stylistic/space-before-blocks': 'warn',
            '@stylistic/quotes': 'warn',
            '@stylistic/quote-props': 'warn',
            '@stylistic/padded-blocks': 'warn',
            '@stylistic/operator-linebreak': 'warn',
            '@stylistic/object-curly-spacing': 'warn',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/no-multiple-empty-lines': 'error',
            '@stylistic/no-multi-spaces': 'error',
            '@stylistic/multiline-ternary': 'off',
            '@stylistic/max-statements-per-line': 'warn',
            '@stylistic/keyword-spacing': 'warn',
            '@stylistic/key-spacing': 'warn',
            '@stylistic/jsx-wrap-multilines': 'warn',
            '@stylistic/jsx-one-expression-per-line': 'warn',
            '@stylistic/jsx-max-props-per-line': 'warn',
            '@stylistic/jsx-indent-props': 'warn',
            '@stylistic/jsx-indent': 'off',
            '@stylistic/jsx-first-prop-new-line': 'off',
            '@stylistic/jsx-curly-newline': 'warn',
            '@stylistic/jsx-closing-tag-location': 'warn',
            '@stylistic/jsx-closing-bracket-location': 'off',
            '@stylistic/indent-binary-ops': 'off',
            '@stylistic/indent': 'off',
            '@stylistic/eol-last': 'error',
            '@stylistic/comma-spacing': 'warn',
            '@stylistic/comma-dangle': 'warn',
            '@stylistic/brace-style': 'error',
            '@stylistic/arrow-spacing': 'warn',
            '@stylistic/arrow-parens': 'warn',
        },
    },
    {
        files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
        rules: {
            'no-undef': 'off',
            'jsdoc/no-types': 'off',
            'tsdoc/syntax': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
    {
        files: ['**/*.js', '**/*.cjs', '**/*.cts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        files: ['**/*.d.ts', '**/*.d.cts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
);
