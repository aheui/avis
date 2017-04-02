const path = require('path');

module.exports = {
    entry: '.',
    context: path.resolve(__dirname, 'src'),
    devtool: 'source-map',
    output: {
        filename: 'avis.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },
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
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'file-loader',
                query: {
                    name: '[path][name].[ext]?[hash:7]',
                    useRelativePath: true,
                }
            }
        ],
    },
};
