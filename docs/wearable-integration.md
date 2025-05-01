# Wearable Device Integration Guide

This guide explains how to integrate wearable health devices with Medexia Saver using Web Bluetooth API and Google Fit API.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Web Bluetooth API Integration](#web-bluetooth-api-integration)
3. [Google Fit API Integration](#google-fit-api-integration)
4. [Troubleshooting](#troubleshooting)

## Prerequisites

Before using these APIs, you need to:

1. **Set up your environment variables**:
   - Copy `.env.example` to `.env.local` and fill in your API keys
   - For Google Fit API, register a project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Fitness API for your project

2. **Browser Compatibility**:
   - Web Bluetooth API is supported in Chrome, Edge, and other Chromium-based browsers
   - Safari has limited support
   - Firefox does not support Web Bluetooth API yet

3. **HTTPS Requirement**:
   - Web Bluetooth API only works on HTTPS or localhost

## Web Bluetooth API Integration

### Connecting to a Bluetooth Health Device

The application provides a simplified way to connect to Bluetooth health devices:

```typescript
import { vitalSignsManager } from '@/services/vitalSignsService';

// Initialize vital signs manager
vitalSignsManager.initialize();

// Connect to a Bluetooth device
const connected = await vitalSignsManager.connectToPlatform('ble');
if (connected) {
  console.log('Connected to Bluetooth device!');
  
  // Get current vital signs
  const vitalSigns = await vitalSignsManager.getCurrentVitalSigns();
  console.log('Vital signs:', vitalSigns);
}
```

### Supported Bluetooth Health Devices

The implementation supports devices that implement the following GATT services:

- Heart Rate Service (0x180D)
- Health Thermometer Service (0x1809)
- Blood Pressure Service (0x1810)
- Pulse Oximeter Service (0x1822)

### Direct WebBluetoothService Usage

For more advanced usage, you can directly use the WebBluetoothService:

```typescript
import { webBluetoothService } from '@/services/webBluetoothService';

// Check if the API is available
if (webBluetoothService.isApiAvailable()) {
  // Request a device
  await webBluetoothService.requestDevice();
  
  // Connect to the device
  const connected = await webBluetoothService.connect();
  
  if (connected) {
    // Start notifications for vital signs
    const unsubscribe = await webBluetoothService.startNotifications((vitalSigns) => {
      console.log('Received vital signs update:', vitalSigns);
    });
    
    // Later, to stop notifications
    unsubscribe();
    
    // Disconnect when done
    await webBluetoothService.disconnect();
  }
}
```

## Google Fit API Integration

### Setting Up Google Fit Integration

To integrate with Google Fit:

1. Create a Google Cloud Platform project
2. Enable the Fitness API
3. Create OAuth 2.0 credentials
4. Add your app's origin to the allowed origins
5. Configure the scopes for the fitness data you need

### Connecting to Google Fit

```typescript
import { vitalSignsManager } from '@/services/vitalSignsService';

// Initialize vital signs manager
vitalSignsManager.initialize();

// Connect to Google Fit
const connected = await vitalSignsManager.connectToPlatform('googlefit');
if (connected) {
  console.log('Connected to Google Fit!');
  
  // Get current vital signs
  const vitalSigns = await vitalSignsManager.getCurrentVitalSigns();
  console.log('Vital signs:', vitalSigns);
  
  // Subscribe to vital signs updates
  vitalSignsManager.addVitalSignsListener((vitalSigns) => {
    console.log('Vital signs updated:', vitalSigns);
  });
}
```

### Direct GoogleFitService Usage

For more control, you can use the GoogleFitService directly:

```typescript
import { googleFitService } from '@/services/googleFitService';

// Initialize Google Fit
await googleFitService.initialize();

// Authorize with Google Fit
const authorized = await googleFitService.authorize();
if (authorized) {
  // Get vital signs
  const vitalSigns = await googleFitService.getVitalSigns();
  console.log('Vital signs from Google Fit:', vitalSigns);
  
  // Subscribe to updates
  const unsubscribe = googleFitService.subscribeToVitalSigns((data) => {
    console.log('Updated vital signs:', data);
  });
  
  // Later, to unsubscribe
  unsubscribe();
  
  // Sign out when done
  await googleFitService.signOut();
}
```

### Data Types

The Google Fit integration provides access to the following data types:

- Heart rate
- Blood pressure
- Oxygen saturation
- Respiratory rate
- Body temperature

## Troubleshooting

### Web Bluetooth API Issues

1. **Device Not Showing Up**:
   - Make sure your device is in pairing mode
   - Check that your device implements one of the supported GATT services
   - Ensure Bluetooth is enabled on your computer/phone

2. **Permission Denied**:
   - The user must explicitly interact with the page to grant Bluetooth permissions
   - Check that you're using HTTPS or localhost

3. **Disconnection Issues**:
   - The library handles reconnection attempts automatically
   - If persistent issues occur, try restarting the Bluetooth device

### Google Fit API Issues

1. **Authorization Failed**:
   - Check that your Google Cloud project has the Fitness API enabled
   - Verify your OAuth credentials are correctly configured
   - Ensure the right scopes are requested

2. **No Data Available**:
   - Users must have data in Google Fit for the API to return values
   - The API can only access data that the user has permitted

3. **API Quota Limits**:
   - Be mindful of API quota limits in the Google Cloud Console
   - Implement caching to reduce API calls

## Resources

- [Web Bluetooth API Specification](https://webbluetoothcg.github.io/web-bluetooth/)
- [Google Fit REST API Documentation](https://developers.google.com/fit/rest/v1/reference)
- [Bluetooth GATT Specifications](https://www.bluetooth.com/specifications/gatt/) 