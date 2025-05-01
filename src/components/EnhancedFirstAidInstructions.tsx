import { useState } from "react";
import { FirstAidInstructions, FirstAidInstructionsProps } from "@/components/FirstAidInstructions";
import { VitalSignsMonitor } from "@/components/vital-signs/VitalSignsMonitor";
import { VitalSigns } from "@/services/vitalSignsService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Smartphone, ArrowRight, Camera } from "lucide-react";
import ARFirstAidVisualization from "@/components/ar/ARFirstAidVisualization";

export function EnhancedFirstAidInstructions(props: FirstAidInstructionsProps) {
  const [criticalVitalSigns, setCriticalVitalSigns] = useState<boolean>(false);
  const [vitalSignsData, setVitalSignsData] = useState<VitalSigns | null>(null);
  const [showARView, setShowARView] = useState<boolean>(false);
  
  // Handle critical vital signs detection
  const handleCriticalVitalSigns = (hasCritical: boolean, vitalSigns: VitalSigns) => {
    setCriticalVitalSigns(hasCritical);
    setVitalSignsData(vitalSigns);
  };
  
  // Determine if we should show emergency recommendations based on vital signs
  const getEmergencyRecommendations = () => {
    if (!vitalSignsData) return null;
    
    const emergencies = [];
    
    if (vitalSignsData.heartRate && vitalSignsData.heartRate > 120) {
      emergencies.push({
        title: "Elevated Heart Rate",
        description: "Heart rate is significantly elevated. This may indicate shock, severe pain, or cardiovascular distress."
      });
    }
    
    if (vitalSignsData.heartRate && vitalSignsData.heartRate < 50) {
      emergencies.push({
        title: "Low Heart Rate",
        description: "Heart rate is abnormally low. This could indicate cardiovascular issues or response to certain injuries."
      });
    }
    
    if (vitalSignsData.oxygenSaturation && vitalSignsData.oxygenSaturation < 92) {
      emergencies.push({
        title: "Low Oxygen Saturation",
        description: "Blood oxygen levels are below normal range. This may indicate respiratory distress or shock."
      });
    }
    
    if (vitalSignsData.bloodPressure && 
        (vitalSignsData.bloodPressure.systolic > 160 || vitalSignsData.bloodPressure.diastolic > 100)) {
      emergencies.push({
        title: "High Blood Pressure",
        description: "Blood pressure is dangerously elevated. This may increase risks of bleeding or indicate other serious conditions."
      });
    }
    
    if (vitalSignsData.bloodPressure && 
        (vitalSignsData.bloodPressure.systolic < 90 || vitalSignsData.bloodPressure.diastolic < 60)) {
      emergencies.push({
        title: "Low Blood Pressure",
        description: "Blood pressure is abnormally low. This may indicate shock or significant blood loss."
      });
    }
    
    if (vitalSignsData.temperature && vitalSignsData.temperature > 39.0) {
      emergencies.push({
        title: "High Fever",
        description: "Body temperature is significantly elevated. This may indicate infection, inflammation, or heat-related illness."
      });
    }
    
    if (vitalSignsData.respirationRate && 
        (vitalSignsData.respirationRate > 24 || vitalSignsData.respirationRate < 10)) {
      emergencies.push({
        title: "Abnormal Respiration",
        description: `Breathing rate ${vitalSignsData.respirationRate > 24 ? "too fast" : "too slow"}. This may indicate respiratory distress or other serious conditions.`
      });
    }
    
    return emergencies.length > 0 ? emergencies : null;
  };
  
  const emergencyRecommendations = getEmergencyRecommendations();
  
  if (showARView) {
    return (
      <ARFirstAidVisualization
        injuryType={props.injuryType}
        severity={props.severity as 'low' | 'medium' | 'high'}
        bodyLocation={props.location}
        firstAidSteps={props.steps || []}
        onClose={() => setShowARView(false)}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Emergency alerts from vital signs */}
      {criticalVitalSigns && emergencyRecommendations && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Vital Signs Detected</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="list-disc pl-5 space-y-1">
              {emergencyRecommendations.map((emergency, idx) => (
                <li key={idx}>
                  <strong>{emergency.title}:</strong> {emergency.description}
                </li>
              ))}
            </ul>
            <div className="mt-3 text-red-800 font-semibold">
              Seek immediate medical attention. These vital signs combined with the present injury increase risk.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="instructions">
        <TabsList className="mb-4">
          <TabsTrigger value="instructions">First Aid Instructions</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instructions" className="space-y-3">
          {/* AR Mode Button */}
          <div className="flex justify-end mb-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowARView(true)}
            >
              <Camera className="h-3.5 w-3.5" />
              View in AR Mode
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          {/* Standard first aid instructions */}
          <FirstAidInstructions {...props} />
          
          {/* Vital signs summary if connected */}
          {vitalSignsData && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Vital Signs Contributing to Assessment</span>
              </div>
              
              <div className="text-sm text-blue-700 space-y-1">
                {vitalSignsData.heartRate && (
                  <div>
                    Heart Rate: <strong>{vitalSignsData.heartRate} BPM</strong> 
                    {vitalSignsData.heartRate > 100 ? " (Elevated)" : 
                     vitalSignsData.heartRate < 60 ? " (Low)" : " (Normal)"}
                  </div>
                )}
                
                {vitalSignsData.bloodPressure && (
                  <div>
                    Blood Pressure: <strong>{vitalSignsData.bloodPressure.systolic}/{vitalSignsData.bloodPressure.diastolic} mmHg</strong>
                  </div>
                )}
                
                {vitalSignsData.oxygenSaturation && (
                  <div>
                    SpO2: <strong>{vitalSignsData.oxygenSaturation}%</strong>
                    {vitalSignsData.oxygenSaturation < 95 ? " (Below optimal)" : " (Normal)"}
                  </div>
                )}
                
                <div className="mt-1 text-xs text-blue-600">
                  These vital signs are being monitored in real-time to enhance injury assessment.
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="vitals">
          <VitalSignsMonitor 
            onCriticalSignsDetected={handleCriticalVitalSigns}
            injuryType={props.injuryType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 