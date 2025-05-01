import { AlertCircle, Clock, Thermometer, MapPin, Droplets, AlertTriangle, ArrowRight, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initiateEmergencyCall } from '@/utils/deviceUtils';

interface FirstAidHeaderProps {
  injuryType: string;
  severity: "low" | "medium" | "high";
  location?: string;
  bloodLevel?: "none" | "minimal" | "moderate" | "severe";
  foreignObjects?: boolean;
}

export function FirstAidHeader({
  injuryType,
  severity,
  location,
  bloodLevel,
  foreignObjects,
}: FirstAidHeaderProps) {
  // Determine background color based on severity
  const getBgColor = () => {
    switch(severity) {
      case "high": return "from-injury-bleeding to-injury-cardiac";
      case "medium": return "from-injury-burn to-injury-burn/80";
      case "low": return "from-injury-sprain to-injury-sprain/80";
      default: return "from-aidify-blue to-aidify-green";
    }
  };
  
  // Get emergency action based on severity
  const getEmergencyAction = () => {
    switch(severity) {
      case "high": return "Call emergency services immediately!";
      case "medium": return "Seek medical attention as soon as possible.";
      case "low": return "Monitor and follow first aid instructions carefully.";
      default: return "Follow the instructions below.";
    }
  };
  
  // Get the estimated response time needed
  const getResponseTime = () => {
    switch(severity) {
      case "high": return "Immediate medical attention required";
      case "medium": return "Medical attention needed within hours";
      case "low": return "Self-care with monitoring";
      default: return "Follow instructions";
    }
  };

  return (
    <div
      className={cn(
        "px-6 py-5 relative overflow-hidden text-white rounded-t-lg border-b border-white/20",
        "bg-gradient-to-r",
        getBgColor()
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <pattern 
            id="medicalPattern" 
            patternUnits="userSpaceOnUse" 
            width="20" 
            height="20" 
            patternTransform="rotate(45)"
          >
            <path 
              d="M10,0 L10,20 M0,10 L20,10" 
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#medicalPattern)" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-1">
              {severity === "high" && 
                <span className="animate-pulse-emergency">
                  <AlertCircle className="h-6 w-6" />
                </span>
              }
              {injuryType}
            </h3>
            
            <p className="text-white/90 text-sm">
              {getEmergencyAction()}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <Badge 
              variant="outline" 
              className={cn(
                "border-white/30 text-white font-semibold",
                severity === "high" && "bg-white/20 border-white/40",
                severity === "medium" && "bg-white/10 border-white/30",
                severity === "low" && "bg-white/5 border-white/20",
                "px-3 py-1"
              )}
            >
              {severity === "high" ? "Severe" : severity === "medium" ? "Moderate" : "Mild"} 
            </Badge>
            
            <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
              <Clock className="h-3.5 w-3.5" />
              <span>{getResponseTime()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          {location && (
            <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
              <MapPin className="h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          )}
          
          {bloodLevel && bloodLevel !== "none" && (
            <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
              <Droplets className="h-3.5 w-3.5" />
              <span>Bleeding: {bloodLevel}</span>
            </div>
          )}
          
          {foreignObjects && (
            <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Foreign objects detected</span>
            </div>
          )}
        </div>
        
        {severity === "high" && (
          <Button
            variant="destructive"
            size="sm"
            className="pulse-animation"
            onClick={() => initiateEmergencyCall("108")}
          >
            <div className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3" />
              <span>Emergency: 108</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
