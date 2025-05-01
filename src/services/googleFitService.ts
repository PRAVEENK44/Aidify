import { VitalSigns } from './vitalSignsService';

// Google Fit API Configuration
const GOOGLE_FIT_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_FIT_API_KEY || '',
  scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.respiratory_rate.read',
    'https://www.googleapis.com/auth/fitness.blood_pressure.read',
    'https://www.googleapis.com/auth/fitness.body_temperature.read',
    'https://www.googleapis.com/auth/fitness.oxygen_saturation.read'
  ],
};

// Google Fit Data Types
const DATA_TYPES = {
  HEART_RATE: 'com.google.heart_rate.bpm',
  STEPS: 'com.google.step_count.delta',
  BLOOD_PRESSURE: 'com.google.blood_pressure',
  OXYGEN_SATURATION: 'com.google.oxygen_saturation',
  RESPIRATORY_RATE: 'com.google.respiratory_rate',
  BODY_TEMPERATURE: 'com.google.body.temperature',
};

interface GoogleFitInitOptions {
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

export class GoogleFitService {
  private static instance: GoogleFitService;
  private isInitialized: boolean = false;
  private isAuthorized: boolean = false;
  private gapi: any = null;
  private listeners = new Set<(data: any) => void>();
  private pollingInterval: number | null = null;

  private constructor() {
    // Load Google API script dynamically if not already loaded
    if (typeof window !== 'undefined' && !window.gapi) {
      this.loadGapiScript();
    }
  }

  public static getInstance(): GoogleFitService {
    if (!GoogleFitService.instance) {
      GoogleFitService.instance = new GoogleFitService();
    }
    return GoogleFitService.instance;
  }

  /**
   * Initialize Google Fit API
   */
  public async initialize(options?: GoogleFitInitOptions): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if gapi is loaded
      if (!window.gapi) {
        await this.loadGapiScript();
      }
      this.gapi = window.gapi;

      // Load the auth2 library
      await new Promise<void>((resolve) => {
        this.gapi.load('auth2', () => resolve());
      });

      // Initialize the auth2 library
      await this.gapi.auth2.init({
        client_id: GOOGLE_FIT_CONFIG.clientId,
        scope: GOOGLE_FIT_CONFIG.scopes.join(' ')
      });

      // Load the client library
      await new Promise<void>((resolve) => {
        this.gapi.load('client', () => resolve());
      });

      // Initialize the client
      await this.gapi.client.init({
        apiKey: GOOGLE_FIT_CONFIG.apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest']
      });

      this.isInitialized = true;
      options?.onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error initializing Google Fit API:', error);
      options?.onFailure?.(error);
      return false;
    }
  }

  /**
   * Load the Google API client script
   */
  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Authorize the app to access Google Fit data
   */
  public async authorize(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (authInstance.isSignedIn.get()) {
        this.isAuthorized = true;
        return true;
      }

      const user = await authInstance.signIn({
        scope: GOOGLE_FIT_CONFIG.scopes.join(' ')
      });

      this.isAuthorized = user.isSignedIn();
      return this.isAuthorized;
    } catch (error) {
      console.error('Error authorizing with Google Fit:', error);
      return false;
    }
  }

  /**
   * Sign out from Google Fit
   */
  public async signOut(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isAuthorized = false;
      return true;
    } catch (error) {
      console.error('Error signing out from Google Fit:', error);
      return false;
    }
  }

  /**
   * Check if user is authorized with Google Fit
   */
  public isUserAuthorized(): boolean {
    return this.isAuthorized;
  }

  /**
   * Get vital signs data from Google Fit
   */
  public async getVitalSigns(): Promise<VitalSigns | null> {
    if (!this.isInitialized || !this.isAuthorized) {
      return null;
    }

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const timeRangeMs = {
        startTimeMillis: oneHourAgo.getTime(),
        endTimeMillis: now.getTime()
      };

      // Get heart rate data
      const heartRateData = await this.getDataset(DATA_TYPES.HEART_RATE, timeRangeMs);
      const heartRate = this.extractLatestValue(heartRateData);

      // Get respiratory rate data
      const respiratoryRateData = await this.getDataset(DATA_TYPES.RESPIRATORY_RATE, timeRangeMs);
      const respirationRate = this.extractLatestValue(respiratoryRateData);

      // Get oxygen saturation data
      const oxygenSaturationData = await this.getDataset(DATA_TYPES.OXYGEN_SATURATION, timeRangeMs);
      const oxygenSaturation = this.extractLatestValue(oxygenSaturationData);

      // Get body temperature data
      const temperatureData = await this.getDataset(DATA_TYPES.BODY_TEMPERATURE, timeRangeMs);
      const temperature = this.extractLatestValue(temperatureData);

      // Get blood pressure data
      const bloodPressureData = await this.getDataset(DATA_TYPES.BLOOD_PRESSURE, timeRangeMs);
      const bloodPressure = this.extractBloodPressure(bloodPressureData);

      return {
        heartRate,
        respirationRate,
        oxygenSaturation,
        temperature,
        bloodPressure,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching vital signs from Google Fit:', error);
      return null;
    }
  }

  /**
   * Get a dataset from Google Fit
   */
  private async getDataset(dataType: string, timeRange: { startTimeMillis: number, endTimeMillis: number }): Promise<any> {
    try {
      const response = await this.gapi.client.fitness.users.dataSources.datasets.get({
        userId: 'me',
        dataSourceId: `derived:${dataType}:com.google.android.gms:merge_${dataType}`,
        datasetId: `${timeRange.startTimeMillis}-${timeRange.endTimeMillis}`
      });

      return response.result;
    } catch (error) {
      console.error(`Error fetching ${dataType} data:`, error);
      return null;
    }
  }

  /**
   * Extract the latest value from a dataset
   */
  private extractLatestValue(dataset: any): number | undefined {
    if (!dataset || !dataset.point || dataset.point.length === 0) {
      return undefined;
    }

    // Sort points by start time in descending order
    const sortedPoints = [...dataset.point].sort((a: any, b: any) => {
      return parseInt(b.startTimeNanos) - parseInt(a.startTimeNanos);
    });

    // Get the latest point
    const latestPoint = sortedPoints[0];
    if (!latestPoint.value || latestPoint.value.length === 0) {
      return undefined;
    }

    return latestPoint.value[0].fpVal;
  }

  /**
   * Extract blood pressure values from a dataset
   */
  private extractBloodPressure(dataset: any): { systolic: number, diastolic: number } | undefined {
    if (!dataset || !dataset.point || dataset.point.length === 0) {
      return undefined;
    }

    // Sort points by start time in descending order
    const sortedPoints = [...dataset.point].sort((a: any, b: any) => {
      return parseInt(b.startTimeNanos) - parseInt(a.startTimeNanos);
    });

    // Get the latest point
    const latestPoint = sortedPoints[0];
    if (!latestPoint.value || latestPoint.value.length < 2) {
      return undefined;
    }

    return {
      systolic: latestPoint.value[0].fpVal, // Systolic pressure
      diastolic: latestPoint.value[1].fpVal // Diastolic pressure
    };
  }

  /**
   * Subscribe to real-time updates (Note: Google Fit doesn't directly support WebSocket-like 
   * real-time updates, so this simulates it by polling at a regular interval)
   */
  public subscribeToVitalSigns(callback: (data: VitalSigns) => void): () => void {
    const intervalId = setInterval(async () => {
      const vitalSigns = await this.getVitalSigns();
      if (vitalSigns) {
        callback(vitalSigns);
      }
    }, 30000); // Poll every 30 seconds

    // Return an unsubscribe function
    return () => clearInterval(intervalId);
  }

  /**
   * Start monitoring vital signs in real-time
   */
  startMonitoring(callback: (data: any) => void, interval: number = 10000): void {
    if (!this.isAuthorized) {
      throw new Error('Not authorized with Google Fit');
    }

    // Add the callback to listeners
    this.listeners.add(callback);

    // Start polling if not already running
    if (this.pollingInterval === null) {
      this.pollingInterval = window.setInterval(async () => {
        try {
          const data = await this.getVitalSigns();
          this.listeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Error during vital signs monitoring:', error);
        }
      }, interval);
    }
  }

  /**
   * Stop monitoring vital signs
   */
  stopMonitoring(callback?: (data: any) => void): void {
    if (callback) {
      // Remove specific callback
      this.listeners.delete(callback);
    } else {
      // Clear all listeners
      this.listeners.clear();
    }

    // Stop polling if no listeners remain
    if (this.listeners.size === 0 && this.pollingInterval !== null) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Check if currently monitoring
   */
  isMonitoring(): boolean {
    return this.pollingInterval !== null;
  }
}

// Add to window object for global access
declare global {
  interface Window {
    gapi: any;
  }
}

// Export a singleton instance
export const googleFitService = GoogleFitService.getInstance(); 