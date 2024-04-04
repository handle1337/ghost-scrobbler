const path = require('path');

module.exports = {
  entry: {
    background_script: {import: './src/background_script.js', filename: '../[name].js'},
    browser_action_script: {import: './src/browserAction/script.js', filename: '../browserAction/[name].js'}
  },
};