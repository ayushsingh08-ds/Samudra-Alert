import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nivara.alert',
  appName: 'Samudra-Alert',
  webDir: 'dist',
  server: {
    // Native scheme; required for modern WebView features
    androidScheme: 'https',
    // ── Live reload during native development (uncomment + set your LAN IP) ──
    // url: 'http://192.168.1.10:5174',
    // cleartext: true,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#FAFAF8',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
