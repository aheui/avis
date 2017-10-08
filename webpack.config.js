const path = require('path');

const webpack = require('webpack');

const production = process.argv.indexOf('-p') !== -1;

module.exports = {
    entry: [
        'react-hot-loader/patch',
        '.',
    ],
    context: path.resolve(__dirname, 'src'),
    devtool: production ? false : 'source-map',
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
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    plugins: production ? [] : [
        new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules)/,
                loader: 'awesome-typescript-loader',
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
