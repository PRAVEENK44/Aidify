import { useState, useEffect } from 'react';
import { useVitalSigns } from '@/hooks/use-vital-signs';
import { VitalSigns } from '@/services/vitalSignsService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, Activity, Thermometer, Droplets, Wifi, WifiOff, AlertCircle, Search, Battery } from 'lucide-react';

interface VitalSignsMonitorProps {
  onCriticalSignsDetected?: (hasCritical: boolean, vitalSigns: VitalSigns) => void;
  injuryType?: string;
}

export function VitalSignsMonitor({ onCriticalSignsDetected, injuryType }: VitalSignsMonitorProps) {
  const {
    isConnected,
    deviceInfo,
    vitalSigns,
    loading,
    error,
    connect,
    disconnect,
    analyzeVitalSigns,
    getAvailableDevices
  } = useVitalSigns();
  
  const [showDeviceSelector, setShowDeviceSelector] = useState<boolean>(false);
  
  // Notify parent component when critical signs are detected
  useEffect(() => {
    if (vitalSigns && onCriticalSignsDetected) {
      const analysis = analyzeVitalSigns();
      if (analysis) {
        onCriticalSignsDetected(analysis.hasCriticalSigns, vitalSigns);
      }
    }
  }, [vitalSigns, onCriticalSignsDetected, analyzeVitalSigns]);
  
  // Format the heart rate into a color based on its value
  const getHeartRateColor = (rate?: number) => {
    if (!rate) return 'text-gray-500';
    if (rate < 60) return 'text-blue-500';
    if (rate > 100) return 'text-red-500';
    return 'text-green-500';
  };
  
  // Format blood pressure text and color
  const getBloodPressureInfo = (bp?: { systolic: number; diastolic: number }) => {
    if (!bp) return { text: 'Not available', color: 'text-gray-500' };
    
    const isHigh = bp.systolic > 140 || bp.diastolic > 90;
    const isLow = bp.systolic < 90 || bp.diastolic < 60;
    
    let color = 'text-green-500';
    if (isHigh) color = 'text-red-500';
    if (isLow) color = 'text-blue-500';
    
    return {
      text: `${bp.systolic}/${bp.diastolic} mmHg`,
      color
    };
  };
  
  // Format oxygen saturation text and color
  const getOxygenInfo = (spo2?: number) => {
    if (!spo2) return { text: 'Not available', color: 'text-gray-500' };
    
    let color = 'text-green-500';
    if (spo2 < 92) color = 'text-red-500';
    if (spo2 < 95) color = 'text-orange-500';
    
    return {
      text: `${spo2}%`,
      color
    };
  };
  
  // Get battery icon based on level
  const getBatteryIcon = (level?: number) => {
    if (!level) return null;
    
    return (
      <div className="flex items-center gap-1">
        <Battery className="h-4 w-4" />
        <span className="text-xs">{level}%</span>
      </div>
    );
  };
  
  // Render the vital signs data
  const renderVitalSigns = () => {
    if (!vitalSigns) {
      return (
        <div className="flex flex-col items-center justify-center py-4">
          <Activity className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No vital signs data available</p>
        </div>
      );
    }
    
    const heartRateColor = getHeartRateColor(vitalSigns.heartRate);
    const bpInfo = getBloodPressureInfo(vitalSigns.bloodPressure);
    const o2Info = getOxygenInfo(vitalSigns.oxygenSaturation);
    
    // Check for critical values
    const analysis = analyzeVitalSigns();
    const hasCriticalSigns = analysis?.hasCriticalSigns || false;
    
    return (
      <div className="space-y-4">
        {hasCriticalSigns && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Vital Signs Detected</AlertTitle>
            <AlertDescription>
              Some vital signs are outside normal ranges. This may indicate medical distress.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {/* Heart Rate */}
          <div className="flex flex-col p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Heart Rate</span>
              <Heart className={`h-4 w-4 ${heartRateColor}`} />
            </div>
            <div className="flex items-baseline">
              <span className={`text-2xl font-semibold ${heartRateColor}`}>
                {vitalSigns.heartRate || '--'}
              </span>
              <span className="text-xs ml-1 text-gray-500">BPM</span>
            </div>
            {vitalSigns.heartRate && (
              <Progress 
                value={Math.min(vitalSigns.heartRate, 150)} 
                max={150}
                className={`h-1 mt-2 ${
                  vitalSigns.heartRate > 100 ? 'bg-red-100' : 
                  vitalSigns.heartRate < 60 ? 'bg-blue-100' : 
                  'bg-green-100'
                }`}
              />
            )}
          </div>
          
          {/* Blood Pressure */}
          <div className="flex flex-col p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Blood Pressure</span>
              <Activity className={`h-4 w-4 ${bpInfo.color}`} />
            </div>
            <div className="flex items-baseline">
              <span className={`text-2xl font-semibold ${bpInfo.color}`}>
                {bpInfo.text}
              </span>
            </div>
          </div>
          
          {/* Oxygen Saturation */}
          <div className="flex flex-col p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">SpO2</span>
              <Droplets className={`h-4 w-4 ${o2Info.color}`} />
            </div>
            <div className="flex items-baseline">
              <span className={`text-2xl font-semibold ${o2Info.color}`}>
                {o2Info.text}
              </span>
            </div>
            {vitalSigns.oxygenSaturation && (
              <Progress 
                value={vitalSigns.oxygenSaturation} 
                max={100}
                className={`h-1 mt-2 ${
                  vitalSigns.oxygenSaturation < 92 ? 'bg-red-100' : 
                  vitalSigns.oxygenSaturation < 95 ? 'bg-orange-100' : 
                  'bg-green-100'
                }`}
              />
            )}
          </div>
          
          {/* Temperature */}
          <div className="flex flex-col p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Temperature</span>
              <Thermometer className={`h-4 w-4 ${vitalSigns.temperature && vitalSigns.temperature > 38 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <div className="flex items-baseline">
              <span className={`text-2xl font-semibold ${vitalSigns.temperature && vitalSigns.temperature > 38 ? 'text-red-500' : 'text-green-500'}`}>
                {vitalSigns.temperature ? vitalSigns.temperature.toFixed(1) : '--'}
              </span>
              <span className="text-xs ml-1 text-gray-500">°C</span>
            </div>
          </div>
          
          {/* Respiratory Rate - if available */}
          {vitalSigns.respirationRate && (
            <div className="flex flex-col p-3 border rounded-lg col-span-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Respiration Rate</span>
                <Activity className={`h-4 w-4 ${vitalSigns.respirationRate > 20 || vitalSigns.respirationRate < 12 ? 'text-orange-500' : 'text-green-500'}`} />
              </div>
              <div className="flex items-baseline">
                <span className={`text-2xl font-semibold ${vitalSigns.respirationRate > 20 || vitalSigns.respirationRate < 12 ? 'text-orange-500' : 'text-green-500'}`}>
                  {vitalSigns.respirationRate}
                </span>
                <span className="text-xs ml-1 text-gray-500">breaths/min</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 flex justify-between items-center mt-2">
          <span>Updated: {vitalSigns.timestamp.toLocaleTimeString()}</span>
          {deviceInfo && getBatteryIcon(deviceInfo.batteryLevel)}
        </div>
      </div>
    );
  };
  
  // Render device selector
  const renderDeviceSelector = () => {
    const devices = getAvailableDevices();
    
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-2">Select a wearable device to connect:</p>
        
        <div className="space-y-2">
          {devices.map(device => {
            let deviceIcon;
            let deviceName;
            
            switch (device) {
              case 'applehealth':
                deviceIcon = <Activity className="h-4 w-4" />;
                deviceName = "Apple Watch";
                break;
              case 'googlefit':
                deviceIcon = <Activity className="h-4 w-4" />;
                deviceName = "Wear OS / Fitbit";
                break;
              case 'ble':
                deviceIcon = <Search className="h-4 w-4" />;
                deviceName = "Bluetooth Heart Rate Monitor";
                break;
              default:
                deviceIcon = <Activity className="h-4 w-4" />;
                deviceName = device;
            }
            
            return (
              <Button
                key={device}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  connect(device);
                  setShowDeviceSelector(false);
                }}
                disabled={loading}
              >
                {deviceIcon}
                <span className="ml-2">{deviceName}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="shadow-sm border-t-4" style={{ borderTopColor: 'var(--aidify-blue)' }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium flex items-center">
              Vital Signs Monitor
              {isConnected ? (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-600 border-gray-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Not Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isConnected && deviceInfo
                ? `Connected to ${deviceInfo.name}`
                : "Connect to a wearable device to monitor vital signs"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Connecting to device...</p>
          </div>
        ) : showDeviceSelector ? (
          renderDeviceSelector()
        ) : (
          renderVitalSigns()
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        {isConnected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              className="flex-1"
            >
              Disconnect
            </Button>
            {injuryType && (
              <div className="text-xs text-gray-500 flex items-center ml-auto">
                <span>Monitoring for: </span>
                <Badge variant="outline" className="ml-1">
                  {injuryType}
                </Badge>
              </div>
            )}
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowDeviceSelector(!showDeviceSelector)}
            className="flex-1"
          >
            {showDeviceSelector ? "Cancel" : "Connect Device"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 