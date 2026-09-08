// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Load every dish JSON file automatically (src/data/**) via require.context.
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
