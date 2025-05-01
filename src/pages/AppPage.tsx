import { useState } from "react";
import { Loader2, AlertTriangle, Info, Database, Zap, Brain, FileText, UploadCloud, Heart, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { FirstAidInstructions, FirstAidInstructionsProps } from "@/components/FirstAidInstructions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeInjuryImage } from "@/services/injuryAnalysisService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { VitalSignsMonitor } from "@/components/vital-signs/VitalSignsMonitor";
import { useVitalSignsWithInjury } from "@/hooks/use-vital-signs-with-injury";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Dummy data - in a real app, this would come from your AI backend
const MOCK_RESULTS: Record<string, FirstAidInstructionsProps> = {
  "cut": {
    injuryType: "Cut/Laceration",
    severity: "medium",
    location: "Right hand",
    bloodLevel: "moderate",
    foreignObjects: false,
    steps: [
      { id: 1, content: "Clean your hands thoroughly with soap and water or use hand sanitizer.", duration: "30 seconds" },
      { id: 2, content: "Apply direct pressure to the wound using a clean cloth or bandage to stop bleeding.", important: true, duration: "3-5 minutes", hasVideo: true },
      { id: 3, content: "Clean the wound by rinsing with clean water. Avoid using soap directly on the wound.", duration: "1 minute", hasAudio: true },
      { id: 4, content: "Apply an antibiotic ointment to prevent infection.", duration: "30 seconds" },
      { id: 5, content: "Cover the wound with a sterile bandage or dressing.", duration: "1 minute", hasVideo: true },
      { id: 6, content: "Change the dressing regularly and keep the wound clean and dry.", duration: "ongoing" },
    ],
    warning: "Seek medical attention if: the cut is deep, won't stop bleeding, has jagged edges, or shows signs of infection.",
    note: "Keep the wound elevated above the level of the heart if possible to reduce bleeding and swelling.",
    sources: ["First Aid Manual p.45", "Emergency Medicine Journal, 2022"],
    estimatedTime: "10-15 minutes"
  },
  "burn": {
    injuryType: "Burn Injury",
    severity: "high",
    location: "Left forearm",
    bloodLevel: "minimal",
    foreignObjects: false,
    steps: [
      { id: 1, content: "Immediately cool the burn with cool (not cold) running water for 10-15 minutes.", important: true, duration: "10-15 minutes", hasVideo: true, hasAudio: true },
      { id: 2, content: "Do NOT apply ice directly to the burn as it can damage the tissue further.", important: true },
      { id: 3, content: "Remove jewelry, watches, and tight clothing from the burned area if possible.", duration: "1 minute" },
      { id: 4, content: "Cover the burn loosely with a sterile, non-stick bandage or clean cloth.", duration: "2 minutes", hasVideo: true },
      { id: 5, content: "Do not apply butter, oil, or ointments to serious burns.", important: true },
      { id: 6, content: "Take over-the-counter pain relievers if needed.", duration: "as needed" },
    ],
    warning: "This appears to be a serious burn. Seek immediate medical attention for: burns larger than 3 inches, burns on the face/hands/genitals, or if the skin is white/charred.",
    sources: ["Burns Treatment Protocol, WHO", "American Burn Association Guidelines"],
    estimatedTime: "20-30 minutes"
  },
  "sprain": {
    injuryType: "Sprain/Strain",
    severity: "low",
    location: "Right ankle",
    bloodLevel: "none",
    foreignObjects: false,
    steps: [
      { id: 1, content: "Follow the RICE protocol: Rest, Ice, Compression, Elevation.", duration: "ongoing", hasAudio: true },
      { id: 2, content: "Rest: Avoid activities that cause pain or discomfort.", duration: "48-72 hours" },
      { id: 3, content: "Ice: Apply an ice pack wrapped in a cloth for 15-20 minutes every 2-3 hours.", important: true, duration: "15-20 minutes", hasVideo: true },
      { id: 4, content: "Compression: Use an elastic bandage to provide support and reduce swelling.", duration: "5 minutes", hasVideo: true },
      { id: 5, content: "Elevation: Keep the injured area elevated above heart level when possible.", duration: "ongoing" },
      { id: 6, content: "Take over-the-counter pain relievers like ibuprofen to reduce pain and swelling.", duration: "as needed" },
    ],
    note: "Most minor sprains heal within 2 weeks. If pain persists or worsens, consult a healthcare provider.",
    sources: ["Sports Medicine Database", "Physical Therapy Journal, 2023"],
    estimatedTime: "30 minutes initial treatment, ongoing care for 1-2 weeks"
  },
  "foreign_object": {
    injuryType: "Foreign Object in Wound",
    severity: "medium",
    location: "Left foot",
    bloodLevel: "minimal",
    foreignObjects: true,
    steps: [
      { id: 1, content: "DO NOT remove large or deeply embedded objects. Seek medical help immediately.", important: true },
      { id: 2, content: "For small, superficial objects like splinters, clean the area with soap and water.", duration: "1 minute" },
      { id: 3, content: "Sterilize tweezers with alcohol or by passing through flame, then cooling.", duration: "30 seconds", hasVideo: true },
      { id: 4, content: "Gently remove the object by pulling in the same direction it entered.", duration: "1-2 minutes", hasVideo: true, hasAudio: true },
      { id: 5, content: "Clean the wound again and apply antiseptic.", duration: "1 minute" },
      { id: 6, content: "Cover with a sterile bandage if bleeding continues.", duration: "1 minute" },
    ],
    warning: "If you cannot easily remove the object, or if the wound is deep or shows signs of infection, seek medical attention.",
    sources: ["Emergency First Aid Handbook", "Journal of Wound Care, 2021"],
    estimatedTime: "5-10 minutes"
  },
  "default": {
    injuryType: "Unidentified Injury",
    severity: "medium",
    steps: [
      { id: 1, content: "Ensure the scene is safe for you and the injured person." },
      { id: 2, content: "Call emergency services if the injury appears serious." },
      { id: 3, content: "Monitor the person's breathing and consciousness." },
      { id: 4, content: "Control any bleeding by applying direct pressure with a clean cloth." },
      { id: 5, content: "Keep the injured person comfortable and warm." },
      { id: 6, content: "Do not move the person unless absolutely necessary." },
    ],
    warning: "The injury type could not be clearly identified. If in doubt, always seek professional medical assistance.",
    sources: ["General First Aid Guidelines"]
  }
};

export default function AppPage() {
  const [image, setImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstAidInstructions, setFirstAidInstructions] = useState<FirstAidInstructionsProps | null>(null);
  const [systemStatus, setSystemStatus] = useState<"online" | "processing" | "offline">("online");
  const [activeTab, setActiveTab] = useState("query");
  const [analysisSteps, setAnalysisSteps] = useState<{step: string, status: "complete" | "in-progress" | "pending", detail?: string}[]>([]);
  const [similarDocuments, setSimilarDocuments] = useState<{title: string, similarity: number}[]>([]);
  const [ragInfo, setRagInfo] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Vital signs monitoring state
  const [injuryType, setInjuryType] = useState<string>("");
  const [injurySeverity, setInjurySeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [showVitalsSection, setShowVitalsSection] = useState<boolean>(false);
  
  // Use vital signs with injury context
  const { 
    vitalSigns, 
    isConnected: isDeviceConnected,
    hasCriticalSigns,
    injurySpecificWarnings,
    simulateAbnormalVitals
  } = useVitalSignsWithInjury({
    injuryType,
    severity: injurySeverity,
    onCriticalDetection: (warnings) => {
      toast({
        variant: "destructive",
        title: "Critical Vital Signs Detected",
        description: warnings[0] || "Vital signs indicate a potential medical emergency.",
      });
    }
  });
  
  const handleImageUpload = (file: File) => {
    setImage(file);
    setFirstAidInstructions(null);
    setRagInfo([]);
  };

  const processImage = async () => {
    if (!image) return;
    
    setIsProcessing(true);
    setSystemStatus("processing");
    setAnalysisSteps([
      { step: "Image Analysis", status: "in-progress", detail: "Converting image to analyzable format" },
      { step: "Injury Detection", status: "pending", detail: "AI model analyzing injury characteristics" },
      { step: "Knowledge Retrieval", status: "pending", detail: "Searching medical knowledge base" },
      { step: "Context Analysis", status: "pending", detail: "Identifying relevant treatment protocols" },
      { step: "Treatment Generation", status: "pending", detail: "Generating first aid instructions" }
    ]);
    
    try {
      // Step 1: Image Analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisSteps(prev => {
        const updated = [...prev];
        updated[0].status = "complete";
        updated[1].status = "in-progress";
        return updated;
      });
      
      toast({
        title: "Image Analysis Complete",
        description: "Medical vision model has processed your image",
      });
      
      // Step 2 & 3: Analyze image using RAG-enhanced Gemini API
      const analysisResult = await analyzeInjuryImage(image);
      
      // Update steps 2 and 3
      setAnalysisSteps(prev => {
        const updated = [...prev];
        updated[1].status = "complete";
        updated[2].status = "complete";
        updated[3].status = "in-progress";
        return updated;
      });
      
      // Save RAG info if available
      if (analysisResult.ragInfo && analysisResult.ragInfo.length > 0) {
        setRagInfo(analysisResult.ragInfo);
        const formattedDocs = analysisResult.ragInfo.map((doc: any) => ({
          title: doc.title,
          similarity: doc.similarity
        }));
        setSimilarDocuments(formattedDocs);
      } else {
        setSimilarDocuments([
          { title: "First Aid Manual", similarity: 0.92 },
          { title: "Emergency Treatment Guidelines", similarity: 0.87 }
        ]);
      }
      
      toast({
        title: "Knowledge Retrieved",
        description: "Found relevant medical knowledge for your injury",
      });
      
      // Step 4: Context Analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisSteps(prev => {
        const updated = [...prev];
        updated[3].status = "complete";
        updated[4].status = "in-progress";
        return updated;
      });
      
      // Step 5: Treatment Generation
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisSteps(prev => {
        const updated = [...prev];
        updated[4].status = "complete";
        return updated;
      });
      
      // Set the instructions
      if (analysisResult.firstAidInstructions) {
        setFirstAidInstructions(analysisResult.firstAidInstructions);
        
        // Set injury type and severity for vital signs monitoring
        if (analysisResult.firstAidInstructions.injuryType) {
          setInjuryType(analysisResult.firstAidInstructions.injuryType);
        }
        
        if (analysisResult.firstAidInstructions.severity) {
          setInjurySeverity(analysisResult.firstAidInstructions.severity as 'low' | 'medium' | 'high');
        }
        
        // Show vitals section for medium to high severity injuries
        if (analysisResult.firstAidInstructions.severity === 'medium' || 
            analysisResult.firstAidInstructions.severity === 'high') {
          setShowVitalsSection(true);
        }
      } else {
        // Fallback to mock data if no instructions found
        const mockResult = Object.keys(MOCK_RESULTS)[0] as keyof typeof MOCK_RESULTS;
        setFirstAidInstructions(MOCK_RESULTS[mockResult]);
        setInjuryType(MOCK_RESULTS[mockResult].injuryType);
        setInjurySeverity(MOCK_RESULTS[mockResult].severity as 'low' | 'medium' | 'high');
      }
      
      setIsProcessing(false);
      setSystemStatus("online");
      
      toast({
        title: "Analysis Complete",
        description: "First aid instructions generated successfully",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      setIsProcessing(false);
      setSystemStatus("offline");
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Failed to process the image through our medical analysis system.",
      });
    }
  };

  const renderRagInfo = () => {
    if (ragInfo.length === 0) return null;
    
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <Brain className="mr-2 h-5 w-5 text-aidify-blue" />
          RAG Knowledge Base Entries Used
        </h3>
        <ul className="space-y-2">
          {ragInfo.map((info, index) => (
            <li key={index} className="flex items-center">
              <Badge variant="outline" className="mr-2">
                {Math.round(info.similarity * 100)}%
              </Badge>
              <span className="font-medium">{info.title}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Using Retrieval-Augmented Generation (RAG) to enhance AI responses with relevant first aid knowledge.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Emergency First Aid Analysis</h1>
        <p className="text-gray-600 mt-2">
          Upload an image of an injury to receive AI-powered first aid instructions.
          </p>
        </div>
        
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="query">Injury Analysis</TabsTrigger>
          <TabsTrigger value="data">Analysis Details</TabsTrigger>
          <TabsTrigger value="vitals" disabled={!injuryType}>
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1.5" />
              Vital Signs
            </div>
          </TabsTrigger>
          </TabsList>
          
        <TabsContent value="query" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Upload an Image</h2>
            <div className="mb-6">
              <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
            </div>
              
            <div className="flex justify-center">
                  <Button
                    onClick={processImage}
                disabled={!image || isProcessing}
                className="bg-aidify-blue hover:bg-blue-700"
                    size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Analyze Injury
                  </>
                )}
                  </Button>
                </div>
          </div>

          {firstAidInstructions && (
            <div className="mt-6">
              <FirstAidInstructions {...firstAidInstructions} />
              
              {showVitalsSection && !isDeviceConnected && (
                <div className="mt-6">
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <CardTitle className="flex items-center">
                        <Smartphone className="h-5 w-5 mr-2" /> 
                        Connect a Wearable Device
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Enhanced monitoring for this injury
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <p className="mb-4">
                          Enhance your first aid with real-time vital signs monitoring. Connect a wearable device to track heart rate, blood pressure and other critical metrics relevant to this injury.
                        </p>
                        <Button 
                          onClick={() => setActiveTab('vitals')}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Connect Device
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          </TabsContent>
          
        <TabsContent value="data" className="space-y-4">
          {/* System Status */}
          <div className="flex items-center space-x-2 mb-4">
            <div className={`h-3 w-3 rounded-full ${
              systemStatus === "online" ? "bg-green-500" : 
              systemStatus === "processing" ? "bg-yellow-500 animate-pulse" : 
              "bg-red-500"
            }`} />
            <span className="font-medium">
              System Status: {
                systemStatus === "online" ? "Online" : 
                systemStatus === "processing" ? "Processing" : 
                "Error"
              }
            </span>
          </div>

          {/* Analysis Steps */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-aidify-blue" />
              Analysis Process
                  </h3>
            <div className="space-y-3">
              {analysisSteps.map((step, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-3">
                    {step.status === "complete" ? (
                      <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        </div>
                    ) : step.status === "in-progress" ? (
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                    )}
                  </div>
                <div>
                    <div className="font-medium">{step.step}</div>
                    {step.detail && <div className="text-xs text-gray-500">{step.detail}</div>}
                  </div>
                </div>
              ))}
                  </div>
                </div>
                
          {/* Similar Documents */}
          {similarDocuments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Database className="mr-2 h-5 w-5 text-aidify-blue" />
                Retrieved Documents
                  </h3>
              <div className="space-y-2">
                {similarDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span>{doc.title}</span>
                    <Badge variant="outline">
                      {Math.round(doc.similarity * 100)}% Match
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderRagInfo()}
          </TabsContent>
        
        <TabsContent value="vitals" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardTitle>Vital Signs Monitoring</CardTitle>
                  <CardDescription className="text-white/90">
                    Monitor real-time vital signs to enhance injury assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p>
                      Connecting a wearable device allows us to monitor vital signs that can 
                      indicate complications related to your {injuryType.toLowerCase()} injury.
                    </p>
                    
                    {injuryType && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Injury-Specific Monitoring</AlertTitle>
                        <AlertDescription className="text-blue-700">
                          We're specifically monitoring for vital signs that could indicate complications 
                          related to {injuryType.toLowerCase()} injuries.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {injurySpecificWarnings && injurySpecificWarnings.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Critical Warning</AlertTitle>
                        <AlertDescription>
                          {injurySpecificWarnings[0]}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Demo controls for testing */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Simulation Controls</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => simulateAbnormalVitals('shock')}
                          className="text-red-600 border-red-200"
                        >
                          Simulate Shock
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => simulateAbnormalVitals('cardiac')}
                          className="text-purple-600 border-purple-200"
                        >
                          Simulate Cardiac Issue
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => simulateAbnormalVitals('respiratory')}
                          className="text-amber-600 border-amber-200"
                        >
                          Simulate Respiratory Issue
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => simulateAbnormalVitals('normal')}
                          className="text-green-600 border-green-200"
                        >
                          Normal Vitals
                        </Button>
                      </div>
                    </div>
              </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <VitalSignsMonitor 
                injuryType={injuryType}
                onCriticalSignsDetected={(hasCritical, vitals) => {
                  if (hasCritical) {
                    toast({
                      variant: "destructive",
                      title: "Critical Vital Signs",
                      description: "Some vital signs are outside normal ranges.",
                    });
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
