
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.systemhunter.app',
  appName: 'System Hunter',
  webDir: 'out',
  server: {
    url: 'https://thesystemss.vercel.app/',
    cleartext: true
  }
};

export default config;
