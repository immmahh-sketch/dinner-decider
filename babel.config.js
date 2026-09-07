module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated's worklets plugin is bundled into babel-preset-expo
    // for SDK 57, so no extra plugin entry is needed here.
  };
};
