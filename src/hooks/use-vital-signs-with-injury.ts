import { useState, useEffect } from 'react';
import { useVitalSigns } from './use-vital-signs';
import { VitalSignsAnalyzer } from '@/services/vitalSignsAnalyzer';
import { VitalSigns } from '@/services/vitalSignsService';

interface UseVitalSignsWithInjuryProps {
  injuryType?: string;
  severity?: 'low' | 'medium' | 'high';
  location?: string;
  onCriticalDetection?: (warnings: string[]) => void;
}

interface VitalSignsWithInjuryResult {
  vitalSigns: VitalSigns | null;
  isConnected: boolean;
  deviceInfo: { name: string; type: string; batteryLevel?: number } | null;
  hasCriticalSigns: boolean;
  injurySpecificWarnings: string[];
  vitalSignsAnalysis: any;
  loading: boolean;
  error: string | null;
  connect: (platformKey: string) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  simulateAbnormalVitals: (scenario: 'shock' | 'cardiac' | 'respiratory' | 'normal') => void;
}

export function useVitalSignsWithInjury({
  injuryType,
  severity = 'medium',
  location,
  onCriticalDetection
}: UseVitalSignsWithInjuryProps): VitalSignsWithInjuryResult {
  // Use the base vital signs hook
  const {
    vitalSigns,
    isConnected,
    deviceInfo,
    loading,
    error,
    connect: baseConnect,
    disconnect: baseDisconnect
  } = useVitalSigns();
  
  // Additional state for injury context
  const [hasCriticalSigns, setHasCriticalSigns] = useState<boolean>(false);
  const [injurySpecificWarnings, setInjurySpecificWarnings] = useState<string[]>([]);
  const [vitalSignsAnalysis, setVitalSignsAnalysis] = useState<any>(null);
  const [simulatedVitalSigns, setSimulatedVitalSigns] = useState<VitalSigns | null>(null);
  
  // Analyze vital signs in the context of the injury
  useEffect(() => {
    if (vitalSigns || simulatedVitalSigns) {
      const signsToAnalyze = simulatedVitalSigns || vitalSigns;
      const analysis = VitalSignsAnalyzer.analyzeVitalSigns(
        signsToAnalyze!,
        injuryType,
        severity
      );
      
      setVitalSignsAnalysis(analysis);
      setHasCriticalSigns(analysis.hasCriticalSigns);
      setInjurySpecificWarnings(analysis.injurySpecificWarnings);
      
      // Notify parent component if critical signs detected
      if (analysis.hasCriticalSigns && onCriticalDetection) {
        onCriticalDetection(analysis.injurySpecificWarnings);
      }
    }
  }, [vitalSigns, simulatedVitalSigns, injuryType, severity, location, onCriticalDetection]);
  
  // Wrapper functions to match the expected return types
  const connect = async (platformKey: string): Promise<boolean> => {
    try {
      await baseConnect(platformKey);
      return isConnected;
    } catch (error) {
      return false;
    }
  };
  
  const disconnect = async (): Promise<boolean> => {
    try {
      await baseDisconnect();
      return !isConnected;
    } catch (error) {
      return false;
    }
  };
  
  // Function to simulate abnormal vital signs for testing/demo purposes
  const simulateAbnormalVitals = (scenario: 'shock' | 'cardiac' | 'respiratory' | 'normal') => {
    const timestamp = new Date();
    
    switch (scenario) {
      case 'shock':
        // Simulate hypovolemic shock - rapid heart rate, low blood pressure, low SpO2
        setSimulatedVitalSigns({
          heartRate: 135,
          bloodPressure: {
            systolic: 85,
            diastolic: 55
          },
          oxygenSaturation: 92,
          temperature: 36.2,
          respirationRate: 22,
          timestamp
        });
        break;
        
      case 'cardiac':
        // Simulate cardiac distress - irregular heart rate, high blood pressure
        setSimulatedVitalSigns({
          heartRate: 48,
          bloodPressure: {
            systolic: 165,
            diastolic: 95
          },
          oxygenSaturation: 94,
          temperature: 37.1,
          respirationRate: 18,
          timestamp
        });
        break;
        
      case 'respiratory':
        // Simulate respiratory distress - rapid breathing, low oxygen
        setSimulatedVitalSigns({
          heartRate: 110,
          bloodPressure: {
            systolic: 140,
            diastolic: 85
          },
          oxygenSaturation: 88,
          temperature: 37.8,
          respirationRate: 28,
          timestamp
        });
        break;
        
      case 'normal':
      default:
        // Normal vital signs or clear simulation
        setSimulatedVitalSigns(null);
        break;
    }
  };
  
  return {
    vitalSigns: simulatedVitalSigns || vitalSigns,
    isConnected,
    deviceInfo,
    hasCriticalSigns,
    injurySpecificWarnings,
    vitalSignsAnalysis,
    loading,
    error,
    connect,
    disconnect,
    simulateAbnormalVitals
  };
} 