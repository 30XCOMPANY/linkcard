const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const { withReactNativeCSS } = require("react-native-css/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withReactNativeCSS(
  withNativewind(config, {
    inlineVariables: false,
    globalClassNamePolyfill: false,
  })
);
