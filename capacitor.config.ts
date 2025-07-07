import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ae9a53e6225845959695ad71d6c57c79',
  appName: 'Medication Scanner',
  webDir: 'dist',
  server: {
    url: 'https://ae9a53e6-2258-4595-9695-ad71d6c57c79.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;