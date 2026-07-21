import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.anga.rozgar",
  appName: "Anga",
  webDir: "dist-mobile",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
};

export default config;
