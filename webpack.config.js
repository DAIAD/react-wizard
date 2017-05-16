var webpack = require('webpack');

module.exports = {
  context: __dirname,
  devtool: 'cheap-module-source-map', 
  entry: [
    "./example/client.jsx"
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      },
    ],
  },
  plugins: [
    //new webpack.optimize.UglifyJsPlugin(),
  ],
  output: {
    filename: "bundle.js",
    publicPath: '/dist/',
    path: __dirname + "/dist/"
  },
}
