const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Lấy config mặc định của Expo
const config = getDefaultConfig(__dirname);

// Bọc với NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
