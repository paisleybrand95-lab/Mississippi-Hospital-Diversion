import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.msems.hospitaldiversion',
  appName: 'MS Hospital Diversion',
  webDir: 'build',
  bundledWebRuntime: false,

  server: {
    // Remove this block for production — only for live-reload dev
    // url: 'http://YOUR_LOCAL_IP:3000',
    // cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#06090f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#c62828',
    },

    StatusBar: {
      style: 'Dark',
      backgroundColor: '#06090f',
    },

    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#c62828',
      sound: 'beep.wav',
    },

    Geolocation: {
      // iOS requires a usage description in Info.plist (added below)
    },
  },

  ios: {
    contentInset: 'always',
    backgroundColor: '#06090f',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
  },

  android: {
    backgroundColor: '#06090f',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
