// Capacitor config — install @capacitor/cli to enable full type checking
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CapacitorConfig = Record<string, any>;

const config: CapacitorConfig = {
  appId: 'com.luna.dashboard',
  appName: 'LUNA Dashboard',
  webDir: 'out',
  server: {
    // For development: point to your live server so Capacitor loads it
    // Comment this out for a fully offline APK (uses `out/` static export)
    url: 'http://localhost:13000',
    cleartext: true,
  },
  android: {
    backgroundColor: '#050810',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#050810',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#00F5FF',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#050810',
    },
  },
};

export default config;
