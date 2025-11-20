import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "volunteam",
  slug: "volunteam",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#031A62",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.volunteam.app",
    buildNumber: "1.0.0",
  },
  android: {
    package: "com.volunteam.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#031A62",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you add them to events.",
        cameraPermission:
          "The app accesses your camera to let you add pictures to events.",
      },
    ],
    "expo-font",
  ],
  updates: {
    url: "https://u.expo.dev/31e7490d-c440-4e35-9ba0-ee539df3bb32",
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    eas: {
      projectId: "31e7490d-c440-4e35-9ba0-ee539df3bb32",
    },
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
  },
});
