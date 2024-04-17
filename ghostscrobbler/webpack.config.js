const path = require('path');
const { resolve } = require('path/posix');

module.exports = {
  resolve: {
    fallback: {
      timers: require.resolve("timers-browserify"),
      string_decoder: require.resolve("string_decoder"),
      buffer: require.resolve("buffer"),
    },
  },
  entry: {
    background_script: {import: './src/background_script.js', filename: '../[name].js'},
    browser_action_script: {import: './src/browserAction/script.js', filename: '../browserAction/[name].js'}
  },
  //mode: 'development',
};