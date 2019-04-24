const path = require('path');
const withUnimodules = require('@expo/webpack-config/withUnimodules');

const projectRoot = path.resolve(__dirname, '..');

module.exports = ({ mode, config }, argv) => withUnimodules(config, { projectRoot }, argv);
