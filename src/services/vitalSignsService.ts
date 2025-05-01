// Types for vital signs data
export interface VitalSigns {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  oxygenSaturation?: number;
  temperature?: number;
  respirationRate?: number;
  timestamp: Date;
}

// Add proper TypeScript declarations for Web Bluetooth API
// These would typically be in a .d.ts file, but adding them here for simplicity
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: {
        filters?: Array<{
          services?: string[];
          name?: string;
          namePrefix?: string;
          manufacturerData?: any;
          serviceData?: any;
        }>;
        optionalServices?: string[];
        acceptAllDevices?: boolean;
      }): Promise<BluetoothDevice>;
    };
  }

  interface BluetoothDevice {
    id: string;
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    dispatchEvent(event: Event): boolean;
  }

  interface BluetoothRemoteGATTServer {
    device: BluetoothDevice;
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>;
  }

  interface BluetoothRemoteGATTService {
    device: BluetoothDevice;
    uuid: string;
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
    getCharacteristics(characteristic?: string): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    service: BluetoothRemoteGATTService;
    uuid: string;
    properties: BluetoothCharacteristicProperties;
    value?: DataView;
    readValue(): Promise<DataView>;
    writeValue(value: BufferSource): Promise<void>;
    startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    dispatchEvent(event: Event): boolean;
  }

  interface BluetoothCharacteristicProperties {
    broadcast: boolean;
    read: boolean;
    writeWithoutResponse: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
    authenticatedSignedWrites: boolean;
    reliableWrite: boolean;
    writableAuxiliaries: boolean;
  }
}

// Interface for health platform adapter implementations
export interface HealthPlatformAdapter {
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  getVitalSigns(): Promise<VitalSigns | null>;
  subscribeToVitalSigns(callback: (data: VitalSigns) => void): Promise<() => void>;
  isConnected(): boolean;
  deviceInfo: () => { name: string; type: string; batteryLevel?: number };
}

// Base class for health platform adapters
abstract class BaseHealthAdapter implements HealthPlatformAdapter {
  protected connected: boolean = false;
  protected deviceName: string = "Unknown Device";
  protected deviceType: string = "Unknown";
  protected batteryLevel?: number;

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<boolean>;
  abstract getVitalSigns(): Promise<VitalSigns | null>;
  abstract subscribeToVitalSigns(callback: (data: VitalSigns) => void): Promise<() => void>;
  
  isConnected(): boolean {
    return this.connected;
  }
  
  deviceInfo() {
    return {
      name: this.deviceName,
      type: this.deviceType,
      batteryLevel: this.batteryLevel
    };
  }
}

// Apple HealthKit adapter
export class AppleHealthKitAdapter extends BaseHealthAdapter {
  constructor() {
    super();
    this.deviceType = "Apple Watch";
  }
  
  async connect(): Promise<boolean> {
    try {
      // Check if we're on iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (!isIOS) {
        console.log("Apple HealthKit is only available on iOS devices");
        return false;
      }
      
      // In a real implementation, we would request permissions from HealthKit
      console.log("Connecting to Apple HealthKit...");
      
      // Simulate successful connection
      this.connected = true;
      this.deviceName = "Apple Watch";
      this.batteryLevel = 78;
      
      return true;
    } catch (error) {
      console.error("Failed to connect to Apple HealthKit:", error);
      return false;
    }
  }
  
  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }
  
  async getVitalSigns(): Promise<VitalSigns | null> {
    if (!this.connected) {
      throw new Error("Not connected to Apple HealthKit");
    }
    
    // This would call the actual HealthKit API in a real implementation
    // For now, we'll return simulated data
    return {
      heartRate: 75 + Math.floor(Math.random() * 10),
      bloodPressure: {
        systolic: 120 + Math.floor(Math.random() * 10),
        diastolic: 80 + Math.floor(Math.random() * 5)
      },
      oxygenSaturation: 97 + Math.floor(Math.random() * 3),
      temperature: 36.5 + (Math.random() * 0.5),
      timestamp: new Date()
    };
  }
  
  async subscribeToVitalSigns(callback: (data: VitalSigns) => void): Promise<() => void> {
    if (!this.connected) {
      throw new Error("Not connected to Apple HealthKit");
    }
    
    // Set up interval to simulate real-time data
    const intervalId = setInterval(() => {
      const data = this.getVitalSigns();
      data.then(result => {
        if (result) callback(result);
      });
    }, 10000); // Every 10 seconds
    
    // Return function to unsubscribe
    return () => clearInterval(intervalId);
  }
}

// Google Fit adapter
export class GoogleFitAdapter extends BaseHealthAdapter {
  private unsubscribeFunc: (() => void) | null = null;
  
  constructor() {
    super();
    this.deviceType = "Android Wearable";
  }
  
  async connect(): Promise<boolean> {
    try {
      // Import the GoogleFitService
      const { googleFitService } = await import('./googleFitService');
      
      // Check if we're on Android
      const isAndroid = /Android/.test(navigator.userAgent);
      if (!isAndroid) {
        console.log("Google Fit is optimized for Android devices");
      }
      
      // Initialize the Google Fit service
      await googleFitService.initialize({
        onFailure: (error) => {
          console.error("Failed to initialize Google Fit:", error);
        }
      });
      
      // Authorize with Google Fit
      const authorized = await googleFitService.authorize();
      if (!authorized) {
        console.error("Failed to authorize with Google Fit");
        return false;
      }
      
      // Successfully connected
      this.connected = true;
      this.deviceName = "Google Fit Device";
      this.batteryLevel = 100; // Not provided by Google Fit API
      
      return true;
    } catch (error) {
      console.error("Failed to connect to Google Fit:", error);
      return false;
    }
  }
  
  async disconnect(): Promise<boolean> {
    try {
      // Import the GoogleFitService
      const { googleFitService } = await import('./googleFitService');
      
      // Stop subscription if active
      if (this.unsubscribeFunc) {
        this.unsubscribeFunc();
        this.unsubscribeFunc = null;
      }
      
      // Sign out from Google Fit
      await googleFitService.signOut();
      
      this.connected = false;
      return true;
    } catch (error) {
      console.error("Error disconnecting from Google Fit:", error);
      return false;
    }
  }
  
  async getVitalSigns(): Promise<VitalSigns | null> {
    if (!this.connected) {
      throw new Error("Not connected to Google Fit");
    }
    
    try {
      // Import the GoogleFitService
      const { googleFitService } = await import('./googleFitService');
      
      // Get vital signs from Google Fit
      return await googleFitService.getVitalSigns();
    } catch (error) {
      console.error("Error getting vital signs from Google Fit:", error);
      return null;
    }
  }
  
  async subscribeToVitalSigns(callback: (data: VitalSigns) => void): Promise<() => void> {
    if (!this.connected) {
      throw new Error("Not connected to Google Fit");
    }
    
    try {
      // Import the GoogleFitService
      const { googleFitService } = await import('./googleFitService');
      
      // Subscribe to vital signs updates
      this.unsubscribeFunc = googleFitService.subscribeToVitalSigns(callback);
      
      return this.unsubscribeFunc;
    } catch (error) {
      console.error("Error subscribing to Google Fit updates:", error);
      throw error;
    }
  }
}

// Bluetooth Low Energy generic device adapter
export class BLEDeviceAdapter extends BaseHealthAdapter {
  private deviceId?: string;
  private unsubscribeFunc: (() => void) | null = null;
  
  constructor() {
    super();
    this.deviceType = "Bluetooth Health Device";
  }
  
  async connect(): Promise<boolean> {
    try {
      // Import the WebBluetoothService
      const { webBluetoothService } = await import('./webBluetoothService');
      
      // Check if Web Bluetooth API is available
      if (!webBluetoothService.isApiAvailable()) {
        console.error("Web Bluetooth API is not available in this browser");
        return false;
      }
      
      // Request device with heart rate service
      const deviceSelected = await webBluetoothService.requestDevice();
      if (!deviceSelected) {
        return false;
      }
      
      // Connect to the device
      const connected = await webBluetoothService.connect();
      if (!connected) {
        return false;
      }
      
      // Get device details
      const deviceDetails = webBluetoothService.getDeviceDetails();
      this.deviceName = deviceDetails.deviceName;
      this.batteryLevel = deviceDetails.batteryLevel;
      
      this.connected = true;
      return true;
    } catch (error) {
      console.error("Failed to connect to BLE device:", error);
      return false;
    }
  }
  
  async disconnect(): Promise<boolean> {
    if (!this.connected) return true;
    
    try {
      // Import the WebBluetoothService
      const { webBluetoothService } = await import('./webBluetoothService');
      
      // Stop notifications if active
      if (this.unsubscribeFunc) {
        this.unsubscribeFunc();
        this.unsubscribeFunc = null;
      }
      
      // Disconnect from the device
      await webBluetoothService.disconnect();
      
      this.connected = false;
      return true;
    } catch (error) {
      console.error("Error disconnecting from BLE device:", error);
      return false;
    }
  }
  
  async getVitalSigns(): Promise<VitalSigns | null> {
    if (!this.connected) {
      throw new Error("Not connected to BLE device");
    }
    
    try {
      // Import the WebBluetoothService
      const { webBluetoothService } = await import('./webBluetoothService');
      
      // Read vital signs
      return await webBluetoothService.readVitalSigns();
    } catch (error) {
      console.error("Error reading vital signs:", error);
      return null;
    }
  }
  
  async subscribeToVitalSigns(callback: (data: VitalSigns) => void): Promise<() => void> {
    if (!this.connected) {
      throw new Error("Not connected to BLE device");
    }
    
    try {
      // Import the WebBluetoothService
      const { webBluetoothService } = await import('./webBluetoothService');
      
      // Start notifications
      this.unsubscribeFunc = await webBluetoothService.startNotifications(callback);
      
      return this.unsubscribeFunc;
    } catch (error) {
      console.error("Error subscribing to vital signs:", error);
      throw error;
    }
  }
}

// VitalSignsManager class to handle multiple platform adapters
export class VitalSignsManager {
  private static instance: VitalSignsManager;
  private adapters: Map<string, HealthPlatformAdapter> = new Map();
  private activeAdapter: HealthPlatformAdapter | null = null;
  private vitalSignsListeners: Array<(data: VitalSigns) => void> = [];
  private unsubscribeFunc: (() => void) | null = null;
  private lastVitalSigns: VitalSigns | null = null;
  
  // Make this a singleton
  private constructor() {}
  
  static getInstance(): VitalSignsManager {
    if (!VitalSignsManager.instance) {
      VitalSignsManager.instance = new VitalSignsManager();
    }
    return VitalSignsManager.instance;
  }
  
  // Initialize with available adapters
  initialize(): void {
    // Register available adapters
    this.adapters.set("applehealth", new AppleHealthKitAdapter());
    this.adapters.set("googlefit", new GoogleFitAdapter());
    this.adapters.set("ble", new BLEDeviceAdapter());
  }
  
  // Get available adapters
  getAvailableAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }
  
  // Connect to a specific platform
  async connectToPlatform(platformKey: string): Promise<boolean> {
    const adapter = this.adapters.get(platformKey);
    
    if (!adapter) {
      throw new Error(`Platform ${platformKey} not found`);
    }
    
    // Disconnect from any existing adapter
    if (this.activeAdapter && this.activeAdapter.isConnected()) {
      await this.disconnect();
    }
    
    const connected = await adapter.connect();
    
    if (connected) {
      this.activeAdapter = adapter;
      
      // Subscribe to vital signs updates
      this.unsubscribeFunc = await adapter.subscribeToVitalSigns((data) => {
        this.lastVitalSigns = data;
        this.notifyListeners(data);
      });
    }
    
    return connected;
  }
  
  // Disconnect from current platform
  async disconnect(): Promise<boolean> {
    if (!this.activeAdapter) return true;
    
    if (this.unsubscribeFunc) {
      this.unsubscribeFunc();
      this.unsubscribeFunc = null;
    }
    
    const result = await this.activeAdapter.disconnect();
    if (result) {
      this.activeAdapter = null;
    }
    
    return result;
  }
  
  // Get current vital signs
  async getCurrentVitalSigns(): Promise<VitalSigns | null> {
    if (!this.activeAdapter || !this.activeAdapter.isConnected()) {
      return null;
    }
    
    return await this.activeAdapter.getVitalSigns();
  }
  
  // Get the most recent vital signs data
  getLastVitalSigns(): VitalSigns | null {
    return this.lastVitalSigns;
  }
  
  // Check if connected to any platform
  isConnected(): boolean {
    return !!this.activeAdapter && this.activeAdapter.isConnected();
  }
  
  // Get info about the connected device
  getConnectedDeviceInfo(): { name: string; type: string; batteryLevel?: number } | null {
    if (!this.activeAdapter) return null;
    return this.activeAdapter.deviceInfo();
  }
  
  // Add a listener for vital signs updates
  addVitalSignsListener(listener: (data: VitalSigns) => void): void {
    this.vitalSignsListeners.push(listener);
  }
  
  // Remove a listener
  removeVitalSignsListener(listener: (data: VitalSigns) => void): void {
    const index = this.vitalSignsListeners.indexOf(listener);
    if (index !== -1) {
      this.vitalSignsListeners.splice(index, 1);
    }
  }
  
  // Notify all listeners with new data
  private notifyListeners(data: VitalSigns): void {
    for (const listener of this.vitalSignsListeners) {
      listener(data);
    }
  }
}

// Export a singleton instance
export const vitalSignsManager = VitalSignsManager.getInstance(); 