import { VitalSigns } from './vitalSignsService';

// Standard GATT service and characteristic UUIDs for health devices
const GATT_SERVICES = {
  HEART_RATE: '0000180d-0000-1000-8000-00805f9b34fb',
  HEALTH_THERMOMETER: '00001809-0000-1000-8000-00805f9b34fb',
  PULSE_OXIMETER: '00001822-0000-1000-8000-00805f9b34fb',
  BLOOD_PRESSURE: '00001810-0000-1000-8000-00805f9b34fb',
  BATTERY: '0000180f-0000-1000-8000-00805f9b34fb',
  DEVICE_INFORMATION: '0000180a-0000-1000-8000-00805f9b34fb',
};

const GATT_CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
  BODY_TEMPERATURE_MEASUREMENT: '00002a1c-0000-1000-8000-00805f9b34fb',
  PULSE_OXIMETRY_MEASUREMENT: '00002a5e-0000-1000-8000-00805f9b34fb',
  BLOOD_PRESSURE_MEASUREMENT: '00002a35-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
  MANUFACTURER_NAME: '00002a29-0000-1000-8000-00805f9b34fb',
  MODEL_NUMBER: '00002a24-0000-1000-8000-00805f9b34fb',
};

export class WebBluetoothService {
  private static instance: WebBluetoothService;
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristics: Map<string, BluetoothRemoteGATTCharacteristic> = new Map();
  private notificationListeners: Map<string, (event: Event) => void> = new Map();
  private lastVitalSigns: VitalSigns = { timestamp: new Date() };
  private isConnected: boolean = false;
  private deviceName: string = "Unknown Device";
  private deviceInfo: {
    manufacturer?: string;
    model?: string;
    batteryLevel?: number;
  } = {};

  private constructor() {}

  public static getInstance(): WebBluetoothService {
    if (!WebBluetoothService.instance) {
      WebBluetoothService.instance = new WebBluetoothService();
    }
    return WebBluetoothService.instance;
  }

  /**
   * Check if Web Bluetooth API is available in the current browser
   */
  public isApiAvailable(): boolean {
    return !!navigator.bluetooth;
  }

  /**
   * Request a Bluetooth device with health monitoring capabilities
   */
  public async requestDevice(): Promise<boolean> {
    if (!this.isApiAvailable()) {
      throw new Error('Web Bluetooth API is not available in this browser');
    }

    try {
      // Define the services we're looking for
      const requestOptions = {
        filters: [
          { services: [GATT_SERVICES.HEART_RATE] },
          { services: [GATT_SERVICES.HEALTH_THERMOMETER] },
          { services: [GATT_SERVICES.PULSE_OXIMETER] },
          { services: [GATT_SERVICES.BLOOD_PRESSURE] },
        ],
        optionalServices: [
          GATT_SERVICES.BATTERY,
          GATT_SERVICES.DEVICE_INFORMATION
        ]
      };

      // Request device with specified filters
      this.device = await navigator.bluetooth.requestDevice(requestOptions);
      this.deviceName = this.device.name || 'Health Monitor Device';
      
      // Add event listener for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnection();
      });

      return true;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      return false;
    }
  }

  /**
   * Connect to the selected Bluetooth device
   */
  public async connect(): Promise<boolean> {
    if (!this.device) {
      console.error('No device selected. Call requestDevice() first.');
      return false;
    }

    try {
      // Connect to GATT server
      if (!this.device.gatt) {
        throw new Error('GATT server not available');
      }
      
      this.server = await this.device.gatt.connect();
      this.isConnected = true;

      // Discover available services and characteristics
      await this.discoverServices();
      
      // Get device information
      await this.getDeviceInfo();
      
      // Get battery level if available
      await this.getBatteryLevel();

      return true;
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the Bluetooth device
   */
  public async disconnect(): Promise<void> {
    if (!this.server) return;

    // Remove all notification listeners
    this.removeAllNotificationListeners();
    
    // Disconnect from the server
    this.server.disconnect();
    this.server = null;
    this.isConnected = false;
  }

  /**
   * Handle device disconnection event
   */
  private handleDisconnection(): void {
    this.isConnected = false;
    this.server = null;
    this.characteristics.clear();
    
    // Emit disconnection event if needed
    console.log('Device disconnected:', this.deviceName);
  }

  /**
   * Discover available services and characteristics
   */
  private async discoverServices(): Promise<void> {
    if (!this.server) return;

    try {
      // Heart Rate service
      try {
        const heartRateService = await this.server.getPrimaryService(GATT_SERVICES.HEART_RATE);
        const heartRateChar = await heartRateService.getCharacteristic(GATT_CHARACTERISTICS.HEART_RATE_MEASUREMENT);
        this.characteristics.set('heartRate', heartRateChar);
      } catch (e) {
        console.log('Heart rate service not available');
      }

      // Health Thermometer service
      try {
        const tempService = await this.server.getPrimaryService(GATT_SERVICES.HEALTH_THERMOMETER);
        const tempChar = await tempService.getCharacteristic(GATT_CHARACTERISTICS.BODY_TEMPERATURE_MEASUREMENT);
        this.characteristics.set('temperature', tempChar);
      } catch (e) {
        console.log('Temperature service not available');
      }

      // Pulse Oximeter service
      try {
        const oxiService = await this.server.getPrimaryService(GATT_SERVICES.PULSE_OXIMETER);
        const oxiChar = await oxiService.getCharacteristic(GATT_CHARACTERISTICS.PULSE_OXIMETRY_MEASUREMENT);
        this.characteristics.set('oxygenSaturation', oxiChar);
      } catch (e) {
        console.log('Pulse oximeter service not available');
      }

      // Blood Pressure service
      try {
        const bpService = await this.server.getPrimaryService(GATT_SERVICES.BLOOD_PRESSURE);
        const bpChar = await bpService.getCharacteristic(GATT_CHARACTERISTICS.BLOOD_PRESSURE_MEASUREMENT);
        this.characteristics.set('bloodPressure', bpChar);
      } catch (e) {
        console.log('Blood pressure service not available');
      }
    } catch (error) {
      console.error('Error discovering services:', error);
    }
  }

  /**
   * Get device information
   */
  private async getDeviceInfo(): Promise<void> {
    if (!this.server) return;

    try {
      const deviceInfoService = await this.server.getPrimaryService(GATT_SERVICES.DEVICE_INFORMATION);
      
      try {
        const manufacturerChar = await deviceInfoService.getCharacteristic(GATT_CHARACTERISTICS.MANUFACTURER_NAME);
        const manufacturerValue = await manufacturerChar.readValue();
        this.deviceInfo.manufacturer = this.decodeString(manufacturerValue);
      } catch (e) {
        console.log('Manufacturer name not available');
      }
      
      try {
        const modelChar = await deviceInfoService.getCharacteristic(GATT_CHARACTERISTICS.MODEL_NUMBER);
        const modelValue = await modelChar.readValue();
        this.deviceInfo.model = this.decodeString(modelValue);
      } catch (e) {
        console.log('Model number not available');
      }
    } catch (e) {
      console.log('Device information service not available');
    }
  }

  /**
   * Get battery level
   */
  private async getBatteryLevel(): Promise<void> {
    if (!this.server) return;

    try {
      const batteryService = await this.server.getPrimaryService(GATT_SERVICES.BATTERY);
      const batteryChar = await batteryService.getCharacteristic(GATT_CHARACTERISTICS.BATTERY_LEVEL);
      const batteryValue = await batteryChar.readValue();
      this.deviceInfo.batteryLevel = batteryValue.getUint8(0);
    } catch (e) {
      console.log('Battery service not available');
    }
  }

  /**
   * Start notifications for all available characteristics
   */
  public async startNotifications(callback: (vitalSigns: VitalSigns) => void): Promise<() => void> {
    // Setup notification listeners for all available characteristics
    await this.setupHeartRateNotifications(callback);
    await this.setupTemperatureNotifications(callback);
    await this.setupOxygenSaturationNotifications(callback);
    await this.setupBloodPressureNotifications(callback);
    
    // Return function to stop all notifications
    return () => this.stopAllNotifications();
  }

  /**
   * Setup heart rate notifications
   */
  private async setupHeartRateNotifications(callback: (vitalSigns: VitalSigns) => void): Promise<void> {
    const heartRateChar = this.characteristics.get('heartRate');
    if (!heartRateChar) return;

    try {
      // Create listener function
      const listener = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        if (target && target.value) {
          const heartRate = this.parseHeartRate(target.value);
          this.lastVitalSigns.heartRate = heartRate;
          this.lastVitalSigns.timestamp = new Date();
          callback({ ...this.lastVitalSigns });
        }
      };

      // Start notifications
      await heartRateChar.startNotifications();
      heartRateChar.addEventListener('characteristicvaluechanged', listener);
      
      // Store the listener for later removal
      this.notificationListeners.set('heartRate', listener);
    } catch (error) {
      console.error('Error setting up heart rate notifications:', error);
    }
  }

  /**
   * Setup temperature notifications
   */
  private async setupTemperatureNotifications(callback: (vitalSigns: VitalSigns) => void): Promise<void> {
    const tempChar = this.characteristics.get('temperature');
    if (!tempChar) return;

    try {
      // Create listener function
      const listener = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        if (target && target.value) {
          const temperature = this.parseTemperature(target.value);
          this.lastVitalSigns.temperature = temperature;
          this.lastVitalSigns.timestamp = new Date();
          callback({ ...this.lastVitalSigns });
        }
      };

      // Start notifications
      await tempChar.startNotifications();
      tempChar.addEventListener('characteristicvaluechanged', listener);
      
      // Store the listener for later removal
      this.notificationListeners.set('temperature', listener);
    } catch (error) {
      console.error('Error setting up temperature notifications:', error);
    }
  }

  /**
   * Setup oxygen saturation notifications
   */
  private async setupOxygenSaturationNotifications(callback: (vitalSigns: VitalSigns) => void): Promise<void> {
    const oxiChar = this.characteristics.get('oxygenSaturation');
    if (!oxiChar) return;

    try {
      // Create listener function
      const listener = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        if (target && target.value) {
          const oxygenSaturation = this.parseOxygenSaturation(target.value);
          this.lastVitalSigns.oxygenSaturation = oxygenSaturation;
          this.lastVitalSigns.timestamp = new Date();
          callback({ ...this.lastVitalSigns });
        }
      };

      // Start notifications
      await oxiChar.startNotifications();
      oxiChar.addEventListener('characteristicvaluechanged', listener);
      
      // Store the listener for later removal
      this.notificationListeners.set('oxygenSaturation', listener);
    } catch (error) {
      console.error('Error setting up oxygen saturation notifications:', error);
    }
  }

  /**
   * Setup blood pressure notifications
   */
  private async setupBloodPressureNotifications(callback: (vitalSigns: VitalSigns) => void): Promise<void> {
    const bpChar = this.characteristics.get('bloodPressure');
    if (!bpChar) return;

    try {
      // Create listener function
      const listener = (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        if (target && target.value) {
          const bloodPressure = this.parseBloodPressure(target.value);
          this.lastVitalSigns.bloodPressure = bloodPressure;
          this.lastVitalSigns.timestamp = new Date();
          callback({ ...this.lastVitalSigns });
        }
      };

      // Start notifications
      await bpChar.startNotifications();
      bpChar.addEventListener('characteristicvaluechanged', listener);
      
      // Store the listener for later removal
      this.notificationListeners.set('bloodPressure', listener);
    } catch (error) {
      console.error('Error setting up blood pressure notifications:', error);
    }
  }

  /**
   * Stop all notifications
   */
  private async stopAllNotifications(): Promise<void> {
    this.removeAllNotificationListeners();
  }

  /**
   * Remove all notification listeners
   */
  private removeAllNotificationListeners(): void {
    for (const [type, listener] of this.notificationListeners.entries()) {
      const char = this.characteristics.get(type);
      if (char) {
        try {
          char.removeEventListener('characteristicvaluechanged', listener);
          char.stopNotifications().catch(e => console.error(`Error stopping ${type} notifications:`, e));
        } catch (e) {
          console.error(`Error removing ${type} listener:`, e);
        }
      }
    }
    this.notificationListeners.clear();
  }

  /**
   * Get the current device info and connection status
   */
  public getDeviceDetails(): {
    isConnected: boolean;
    deviceName: string;
    manufacturer?: string;
    model?: string;
    batteryLevel?: number;
  } {
    return {
      isConnected: this.isConnected,
      deviceName: this.deviceName,
      ...this.deviceInfo
    };
  }

  /**
   * Get the latest vital signs
   */
  public getLatestVitalSigns(): VitalSigns {
    return { ...this.lastVitalSigns };
  }

  /**
   * Read all available vital signs
   */
  public async readVitalSigns(): Promise<VitalSigns> {
    try {
      // Read heart rate if available
      const heartRateChar = this.characteristics.get('heartRate');
      if (heartRateChar) {
        const value = await heartRateChar.readValue();
        this.lastVitalSigns.heartRate = this.parseHeartRate(value);
      }

      // Read temperature if available
      const tempChar = this.characteristics.get('temperature');
      if (tempChar) {
        const value = await tempChar.readValue();
        this.lastVitalSigns.temperature = this.parseTemperature(value);
      }

      // Read oxygen saturation if available
      const oxiChar = this.characteristics.get('oxygenSaturation');
      if (oxiChar) {
        const value = await oxiChar.readValue();
        this.lastVitalSigns.oxygenSaturation = this.parseOxygenSaturation(value);
      }

      // Read blood pressure if available
      const bpChar = this.characteristics.get('bloodPressure');
      if (bpChar) {
        const value = await bpChar.readValue();
        this.lastVitalSigns.bloodPressure = this.parseBloodPressure(value);
      }

      // Update timestamp
      this.lastVitalSigns.timestamp = new Date();

      return { ...this.lastVitalSigns };
    } catch (error) {
      console.error('Error reading vital signs:', error);
      return this.lastVitalSigns;
    }
  }

  /**
   * Parse heart rate from DataView
   */
  private parseHeartRate(value: DataView): number {
    // Check heart rate format (first bit of first byte)
    const flags = value.getUint8(0);
    const isContactDetected = flags & 0x2; // Second bit
    const format = flags & 0x1; // First bit

    // Get heart rate value
    let heartRate: number;
    if (format === 0) {
      // Heart Rate is in the 2nd byte, UINT8 format
      heartRate = value.getUint8(1);
    } else {
      // Heart Rate is in the 2nd and 3rd bytes, UINT16 format
      heartRate = value.getUint16(1, true);
    }

    return heartRate;
  }

  /**
   * Parse temperature from DataView
   */
  private parseTemperature(value: DataView): number {
    // IEEE 11073 32-bit float
    const tempValue = value.getFloat32(1, true);
    
    // Convert to Celsius if necessary (depends on device)
    return tempValue;
  }

  /**
   * Parse oxygen saturation from DataView
   */
  private parseOxygenSaturation(value: DataView): number {
    // Specific implementation depends on device
    // This is a simplified version
    const spo2 = value.getUint8(1);
    return spo2;
  }

  /**
   * Parse blood pressure from DataView
   */
  private parseBloodPressure(value: DataView): { systolic: number, diastolic: number } {
    // Specific implementation depends on device
    // This is a simplified version
    const systolic = value.getUint16(1, true) / 10; // IEEE 11073 16-bit SFLOAT
    const diastolic = value.getUint16(3, true) / 10; // IEEE 11073 16-bit SFLOAT
    
    return { systolic, diastolic };
  }

  /**
   * Decode string from DataView
   */
  private decodeString(dataView: DataView): string {
    let str = '';
    for (let i = 0; i < dataView.byteLength; i++) {
      str += String.fromCharCode(dataView.getUint8(i));
    }
    return str;
  }
}

// Export a singleton instance
export const webBluetoothService = WebBluetoothService.getInstance(); 