const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './js/entry.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    publicPath: 'http://localhost:8080/dist'
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.join(__dirname, 'js')
      }
    ]
  }
}
