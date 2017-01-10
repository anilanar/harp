module.exports = {
    entry: './src/root.js',
    output: {
        filename: 'lib/main.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    devtool: 'source-map',
};
