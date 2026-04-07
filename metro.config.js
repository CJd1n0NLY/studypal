const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// EXPLICITLY add glb, gltf, and bin to the asset extensions
config.resolver.assetExts.push("glb", "gltf", "bin");

module.exports = config;
