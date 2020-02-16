var path = require('path');

module.exports = {
  entry: "./index",
  devServer: {
    contentBase: path.join(__dirname, 'index'),
    compress: true,
    port: 9000
  }
}