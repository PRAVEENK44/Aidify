import { useState } from "react";
import { EnhancedInjuryDetection } from "@/types/firstAid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Thermometer, ThermometerSun, List, Stethoscope, FileText, AlertCircle } from "lucide-react";

// Injury categories with their colors
const injuryColors: Record<string, string> = {
  burn: "text-injury-burn bg-injury-burn/10 border-injury-burn/30",
  cut: "text-injury-cut bg-injury-cut/10 border-injury-cut/30",
  fracture: "text-injury-fracture bg-injury-fracture/10 border-injury-fracture/30",
  sprain: "text-injury-sprain bg-injury-sprain/10 border-injury-sprain/30",
  cardiac: "text-injury-cardiac bg-injury-cardiac/10 border-injury-cardiac/30",
  stroke: "text-injury-stroke bg-injury-stroke/10 border-injury-stroke/30",
  choking: "text-injury-choking bg-injury-choking/10 border-injury-choking/30",
  bleeding: "text-injury-bleeding bg-injury-bleeding/10 border-injury-bleeding/30",
  allergic: "text-injury-allergic bg-injury-allergic/10 border-injury-allergic/30",
  head: "text-injury-head bg-injury-head/10 border-injury-head/30",
  eye: "text-injury-eye bg-injury-eye/10 border-injury-eye/30",
  poisoning: "text-injury-poisoning bg-injury-poisoning/10 border-injury-poisoning/30",
  other: "text-gray-700 bg-gray-100 border-gray-300",
};

const severityIcons = {
  low: <Thermometer className="h-5 w-5 text-green-500" />,
  medium: <Thermometer className="h-5 w-5 text-yellow-500" />,
  high: <ThermometerSun className="h-5 w-5 text-red-500" />,
};

interface EnhancedInjuryDetectionComponentProps {
  data: EnhancedInjuryDetection;
}

export function EnhancedInjuryDetectionComponent({ data }: EnhancedInjuryDetectionComponentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const getUrgencyLabel = (level: number) => {
    switch(level) {
      case 1: return "Very Low";
      case 2: return "Low";
      case 3: return "Moderate";
      case 4: return "High";
      case 5: return "Critical";
      default: return "Unknown";
    }
  };
  
  const getUrgencyColor = (level: number) => {
    switch(level) {
      case 1: return "bg-green-400";
      case 2: return "bg-yellow-400";
      case 3: return "bg-orange-400";
      case 4: return "bg-red-400";
      case 5: return "bg-red-600";
      default: return "bg-gray-400";
    }
  };
  
  return (
    <Card className="shadow-md border-t-4 animate-fade-in" style={{borderTopColor: `var(--injury-${data.category})`}}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              {data.injuryType}
              <Badge className={cn("ml-2 border", injuryColors[data.category])}>
                {data.category.charAt(0).toUpperCase() + data.category.slice(1)}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {data.probability > 0.85 ? "High confidence detection" : 
              data.probability > 0.6 ? "Moderate confidence detection" : 
              "Low confidence detection"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{Math.round(data.probability * 100)}%</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              {severityIcons[data.details.severity]}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="causes">Causes</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="pt-2">
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    Urgency Level: {getUrgencyLabel(data.urgencyLevel)}
                  </h4>
                  <span className="text-xs text-gray-500">{data.urgencyLevel}/5</span>
                </div>
                <Progress 
                  value={data.urgencyLevel * 20} 
                  className={cn("h-2", getUrgencyColor(data.urgencyLevel))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Severity</h4>
                  <p className="text-sm font-medium capitalize">{data.details.severity}</p>
                </div>
                
                {data.details.location && (
                  <div className="rounded-lg border p-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Location</h4>
                    <p className="text-sm font-medium">{data.details.location}</p>
                  </div>
                )}
                
                {data.details.bloodLevel && data.details.bloodLevel !== "none" && (
                  <div className="rounded-lg border p-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Bleeding</h4>
                    <p className="text-sm font-medium capitalize">{data.details.bloodLevel}</p>
                  </div>
                )}
                
                {data.details.foreignObjects && (
                  <div className="rounded-lg border p-3 bg-amber-50 border-amber-200">
                    <h4 className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Warning
                    </h4>
                    <p className="text-sm font-medium text-amber-800">Foreign objects detected</p>
                  </div>
                )}
              </div>
              
              <div className="rounded-lg border p-3 bg-gray-50">
                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Detection Details
                </h4>
                <ul className="text-sm space-y-1">
                  {data.imageSignifiers.map((sign, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs bg-gray-200 rounded-full h-4 w-4 flex items-center justify-center mt-0.5">•</span>
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="symptoms" className="pt-2">
          <CardContent>
            <div className="rounded-lg border p-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                Common Symptoms
              </h4>
              <ul className="space-y-2">
                {data.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-aidify-blue"></div>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="causes" className="pt-2">
          <CardContent>
            <div className="rounded-lg border p-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                <List className="h-4 w-4 text-gray-500" />
                Common Causes
              </h4>
              <ul className="space-y-2">
                {data.commonCauses.map((cause, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-aidify-green"></div>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
