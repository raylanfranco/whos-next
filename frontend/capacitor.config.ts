import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.victoryrush.whosnext',
  appName: "Who's Next?",
  webDir: 'dist',
  server: {
    // For dev only — uncomment to test against local dev server:
    // url: 'http://localhost:5173',
    // cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
