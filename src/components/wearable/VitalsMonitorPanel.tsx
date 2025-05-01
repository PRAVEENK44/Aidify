import { useState, useEffect } from 'react';
import { useVitalSigns } from '@/hooks/use-vital-signs';
import { VitalSigns } from '@/services/vitalSignsService';
import { VitalSignsAnalyzer } from '@/services/vitalSignsAnalyzer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Search, 
  Battery,
  Smartphone,
  Watch,
  Gauge,
  BarChart3
} from 'lucide-react';

interface VitalsMonitorPanelProps {
  injuryType?: string;
  severity?: 'low' | 'medium' | 'high';
  onVitalSignsUpdated?: (vitals: VitalSigns | null) => void;
  onCriticalSignsDetected?: (critical: boolean, warnings: string[]) => void;
}

export function VitalsMonitorPanel({ 
  injuryType, 
  severity = 'medium',
  onVitalSignsUpdated,
  onCriticalSignsDetected 
}: VitalsMonitorPanelProps) {
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
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [injurySpecificAlerts, setInjurySpecificAlerts] = useState<string[]>([]);
  
  // Send vital signs data to parent component when updated
  useEffect(() => {
    if (onVitalSignsUpdated && vitalSigns) {
      onVitalSignsUpdated(vitalSigns);
    }
  }, [vitalSigns, onVitalSignsUpdated]);
  
  // Analyze vital signs when they change, considering the injury type
  useEffect(() => {
    if (vitalSigns) {
      const result = VitalSignsAnalyzer.analyzeVitalSigns(vitalSigns, injuryType, severity);
      setAnalysisResult(result);
      
      if (onCriticalSignsDetected) {
        onCriticalSignsDetected(
          result.hasCriticalSigns, 
          result.injurySpecificWarnings
        );
      }
      
      setInjurySpecificAlerts(result.injurySpecificWarnings);
    }
  }, [vitalSigns, injuryType, severity, onCriticalSignsDetected]);
  
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
  
  // Render the device selector
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
                deviceIcon = <Watch className="h-4 w-4" />;
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
                deviceIcon = <Smartphone className="h-4 w-4" />;
                deviceName = "Unknown Device";
            }
            
            return (
              <Button 
                key={device}
                variant="outline" 
                size="sm"
                className="w-full flex justify-between items-center h-auto py-3"
                onClick={() => connect(device)}
                disabled={loading}
              >
                <div className="flex items-center">
                  {deviceIcon}
                  <span className="ml-2">{deviceName}</span>
                </div>
                {loading && device === 'connecting' && (
                  <Activity className="h-4 w-4 animate-pulse" />
                )}
              </Button>
            );
          })}
        </div>
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
    
    return (
      <div className="space-y-4">
        {analysisResult?.hasCriticalSigns && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Vital Signs Detected</AlertTitle>
            <AlertDescription>
              {analysisResult.overallRecommendation}
            </AlertDescription>
          </Alert>
        )}
        
        {injurySpecificAlerts.length > 0 && (
          <Alert className="mb-3 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Injury-Specific Warning</AlertTitle>
            <AlertDescription className="text-amber-700 mt-1">
              <ul className="list-disc pl-5 space-y-1">
                {injurySpecificAlerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
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
        </div>
        
        <div className="text-xs text-gray-500 flex justify-between items-center mt-2">
          <span>Updated: {vitalSigns.timestamp.toLocaleTimeString()}</span>
          {deviceInfo && (
            <div className="flex items-center gap-1">
              <Battery className="h-4 w-4" />
              <span>{deviceInfo.batteryLevel || 'N/A'}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardTitle className="flex items-center text-lg">
          <Gauge className="h-5 w-5 mr-2" />
          Vital Signs Monitor
        </CardTitle>
        <CardDescription className="text-white/80">
          Connect to a wearable device for enhanced analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!isConnected ? (
          showDeviceSelector ? renderDeviceSelector() : (
            <div className="flex flex-col items-center justify-center py-4">
              <WifiOff className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">No wearable device connected</p>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Connect a wearable device to monitor vital signs and improve injury assessment
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowDeviceSelector(true)}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Connect Device
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
                <span className="text-sm text-gray-600 ml-2">
                  {deviceInfo?.name || 'Unknown Device'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 h-8"
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
            </div>
            
            {renderVitalSigns()}
          </div>
        )}
      </CardContent>
      
      {isConnected && analysisResult && (
        <CardFooter className="bg-gray-50 border-t px-6 py-4">
          <div className="w-full">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Vital Signs Analysis</h4>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {analysisResult.overallRecommendation}
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 