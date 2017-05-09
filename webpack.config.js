const path = require('path');

const webpack = require('webpack');


module.exports = {
    entry: [
        'react-hot-loader/patch',
        '.',
    ],
    context: path.resolve(__dirname, 'src'),
    devtool: 'source-map',
    devServer: {
        host: '0.0.0.0',
        port: 4715,
        hot: true,
    },
    output: {
        filename: 'avis.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    plugins: [
                        'transform-runtime',
                        'transform-object-rest-spread',
                        'transform-class-properties',
                        'react-hot-loader/babel',
                    ],
                    presets: [
                        ['env', {
                            targets: {
                                browsers: [
                                    'last 2 Chrome versions',
                                    'last 2 Firefox versions',
                                ],
                            },
                        }],
                        'react',
                    ],
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        camelCase: true,
                    },
                }],
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)(\?.*)?$/,
                loader: 'file-loader',
                query: {
                    name: '[hash:7].[ext]',
                    emitFile: true,
                }
            }
        ],
    },
};
