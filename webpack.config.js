const path = require('path');
const webpack = require('webpack');

const dependencies = require('./package.json').dependencies;

module.exports = {

  entry: {
    recommend: `${__dirname}/actions/recommend`,
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs',
  },
  // only package into webpack modules that have been explicitely
  // added to dependencies in the package.json.
  // The others are expected to come from OpenWhisk.
  // http://webpack.github.io/docs/configuration.html#externals
  externals: (context, request, callback) => {
    // console.log('\nrequest', context, request);
    if (request.startsWith('@')) {
      console.log('...', request, 'is assumed to be an external dependency');
      callback(null, `commonjs ${request}`);
    } else if (context.indexOf('node_modules') === -1 &&
      request.indexOf('/') === -1 &&
      !dependencies[request]) {
      console.log('...', request, 'is assumed to be an external dependency');
      callback(null, `commonjs ${request}`);
    } else {
      callback();
    }
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' }
    ],
  },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Useful to reduce the size of libraries
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    // optimizations
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //   },
    // }),
  ],
};
