import { useState, useEffect } from 'react';
import { vitalSignsManager, VitalSigns } from '@/services/vitalSignsService';

// Custom hook for managing vital signs in a component
export function useVitalSigns() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<{ name: string; type: string; batteryLevel?: number } | null>(null);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize vital signs manager
  useEffect(() => {
    vitalSignsManager.initialize();
  }, []);
  
  // Connect to a platform
  const connect = async (platformKey: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const connected = await vitalSignsManager.connectToPlatform(platformKey);
      
      if (connected) {
        setIsConnected(true);
        setDeviceInfo(vitalSignsManager.getConnectedDeviceInfo());
        
        // Get initial vital signs
        const initialVitalSigns = await vitalSignsManager.getCurrentVitalSigns();
        if (initialVitalSigns) {
          setVitalSigns(initialVitalSigns);
        }
      } else {
        setError(`Failed to connect to ${platformKey}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Disconnect from current platform
  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await vitalSignsManager.disconnect();
      
      if (result) {
        setIsConnected(false);
        setDeviceInfo(null);
        // Maintain the last vital signs for a while
      } else {
        setError('Failed to disconnect');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Set up listener for vital signs updates
  useEffect(() => {
    const vitalSignsListener = (data: VitalSigns) => {
      setVitalSigns(data);
    };
    
    vitalSignsManager.addVitalSignsListener(vitalSignsListener);
    
    return () => {
      vitalSignsManager.removeVitalSignsListener(vitalSignsListener);
    };
  }, []);
  
  // Check for critical vital signs
  const analyzeVitalSigns = () => {
    if (!vitalSigns) return null;
    
    const criticalLevels = {
      highHeartRate: vitalSigns.heartRate && vitalSigns.heartRate > 100,
      lowHeartRate: vitalSigns.heartRate && vitalSigns.heartRate < 60,
      highBloodPressure: vitalSigns.bloodPressure && 
        (vitalSigns.bloodPressure.systolic > 140 || vitalSigns.bloodPressure.diastolic > 90),
      lowOxygenSaturation: vitalSigns.oxygenSaturation && vitalSigns.oxygenSaturation < 92,
      highRespirationRate: vitalSigns.respirationRate && vitalSigns.respirationRate > 20,
      lowRespirationRate: vitalSigns.respirationRate && vitalSigns.respirationRate < 12,
      fever: vitalSigns.temperature && vitalSigns.temperature > 38.0,
    };
    
    // Check if any critical levels are met
    const hasCriticalSigns = Object.values(criticalLevels).some(Boolean);
    
    return {
      criticalLevels,
      hasCriticalSigns
    };
  };
  
  // Get available adapters
  const getAvailableDevices = () => {
    return vitalSignsManager.getAvailableAdapters();
  };
  
  return {
    isConnected,
    deviceInfo,
    vitalSigns,
    loading,
    error,
    connect,
    disconnect,
    analyzeVitalSigns,
    getAvailableDevices
  };
} 