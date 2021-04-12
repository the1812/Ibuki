const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const path = require('path')

const meta = require('../src/index.meta.json')
const getBanner = () => `// ==UserScript==\n${Object.entries(meta).map(([key, value]) => {
  if (Array.isArray(value)) {
    return value.map(item => `// @${key.padEnd(16, ' ')}${item}`).join('\n')
  }
  return `// @${key.padEnd(16, ' ')}${value}`
}).join('\n')}
// ==/UserScript==
/* eslint-disable */ /* spell-checker: disable */
// @[ You can find all source codes in GitHub repo ]`
const relativePath = p => path.join(process.cwd(), p)
const getConfig = (_, { mode }) => {
  const src = relativePath('src')
  return {
    mode: mode || 'development',
    output: {
      filename: mode === 'production' ? 'ibuki.user.js' : 'ibuki.dev.user.js',
    },
    // devtool: 'eval-source-map',
    watchOptions: {
      ignored: /node_modules/,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    performance: {
      hints: false,
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            output: {
              comments: /==\/?UserScript==|^[ ]?@|eslint-disable|spell-checker/i,
            },
          },
          extractComments: false,
        }),
      ],
    },
    module: {
      rules: [
        // {
        //   test: /\.woff2$/,
        //   loader: 'url-loader',
        //   options: {
        //     mimetype: 'font/woff2',
        //   },
        //   include: [src],
        // },
        // {
        //   test: /\.svg$|\.md$/,
        //   loader: 'raw-loader',
        //   include: [src],
        // },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader',
          ],
          include: [src],
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                cacheCompression: false,
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react',
                  [
                    '@babel/preset-typescript',
                    {
                      allExtensions: true,
                      isTSX: true,
                    },
                  ],
                ],
                plugins: [
                  ['@babel/plugin-proposal-class-properties'],
                ],
              },
            }
          ],
          include: [
            src,
          ],
        },
      ],
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new webpack.BannerPlugin({
        banner: getBanner(),
        raw: true,
        entryOnly: true,
      }),
    ],
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      }
    }
  }
}

module.exports = getConfig
