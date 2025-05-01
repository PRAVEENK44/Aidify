
import { useState, useEffect } from 'react';
import { InjuryTypeCategory, EnhancedInjuryDetection, PathwayApiResponse } from '@/types/firstAid';
import { Loader2, Brain, Zap, Database, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PathwayPredictionSystemProps {
  isProcessing: boolean;
  imageUrl?: string;
  onResult?: (result: PathwayApiResponse) => void;
}

// This component simulates a real Pathway API prediction system
export function PathwayPredictionSystem({ 
  isProcessing, 
  imageUrl, 
  onResult 
}: PathwayPredictionSystemProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'initializing' | 'analyzing' | 'retrieving' | 'generating' | 'complete'>('initializing');
  const [predictionDetails, setPredictionDetails] = useState<string[]>([]);

  // Simulated injury detection based on image features
  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setStage('initializing');
      setPredictionDetails([]);
      return;
    }

    let timer: number;
    let currentProgress = 0;
    
    const advanceProgress = () => {
      currentProgress += Math.random() * 15;
      
      if (currentProgress < 25) {
        setStage('initializing');
        setPredictionDetails(prev => [...prev, 'Initializing medical vision model...']);
      } else if (currentProgress < 50) {
        setStage('analyzing');
        setPredictionDetails(prev => [...prev, 'Analyzing image features...']);
      } else if (currentProgress < 75) {
        setStage('retrieving');
        setPredictionDetails(prev => [...prev, 'Retrieving relevant medical knowledge...']);
      } else if (currentProgress < 99) {
        setStage('generating');
        setPredictionDetails(prev => [...prev, 'Generating first aid instructions...']);
      } else {
        setStage('complete');
        setPredictionDetails(prev => [...prev, 'Processing complete']);
        
        // Generate the final result based on the imageUrl (would be a real AI prediction in production)
        if (onResult) {
          // In a real implementation, this would analyze the image and return relevant results
          // For now, we'll simulate different responses based on the image URL string content
          const simulatedResult = generateSimulatedResponse(imageUrl || '');
          onResult(simulatedResult);
        }
        
        clearInterval(timer);
        return;
      }
      
      setProgress(Math.min(currentProgress, 99));
    };
    
    timer = window.setInterval(advanceProgress, 500);
    
    return () => {
      clearInterval(timer);
    };
  }, [isProcessing, imageUrl, onResult]);

  // This function simulates different prediction results based on the image URL
  // In a real implementation, this would be a call to the Pathway API
  const generateSimulatedResponse = (imageUrl: string): PathwayApiResponse => {
    // In reality, this would analyze the actual image content with computer vision
    // For our demo, we'll extract information from the URL to simulate different responses
    let injuryType = "Minor Wound";
    let severity: "low" | "medium" | "high" = "low";
    let category: InjuryTypeCategory = "cut";
    
    // Simulate different injury types based on URL pattern
    if (imageUrl.includes("burn") || imageUrl.toLowerCase().includes("fire")) {
      injuryType = "Second-degree Burn";
      severity = "medium";
      category = "burn";
    } else if (imageUrl.includes("fracture") || imageUrl.toLowerCase().includes("bone")) {
      injuryType = "Suspected Fracture";
      severity = "medium";
      category = "fracture";
    } else if (imageUrl.includes("bleed") || imageUrl.toLowerCase().includes("blood")) {
      injuryType = "Severe Bleeding";
      severity = "high";
      category = "bleeding";
    } else if (imageUrl.includes("heart") || imageUrl.toLowerCase().includes("chest")) {
      injuryType = "Possible Cardiac Event";
      severity = "high";
      category = "cardiac";
    } else if (imageUrl.includes("head") || imageUrl.toLowerCase().includes("concussion")) {
      injuryType = "Head Injury";
      severity = "medium";
      category = "head";
    } else if (imageUrl.includes("allerg") || imageUrl.toLowerCase().includes("reaction")) {
      injuryType = "Allergic Reaction";
      severity = "medium";
      category = "allergic";
    } else if (imageUrl.includes("chok") || imageUrl.toLowerCase().includes("airway")) {
      injuryType = "Choking";
      severity = "high";
      category = "choking";
    } else if (imageUrl.includes("sprain") || imageUrl.toLowerCase().includes("twist")) {
      injuryType = "Ankle Sprain";
      severity = "low";
      category = "sprain";
    } else if (imageUrl.includes("eye") || imageUrl.toLowerCase().includes("vision")) {
      injuryType = "Eye Injury";
      severity = "medium";
      category = "eye";
    } else if (imageUrl.includes("stroke") || imageUrl.toLowerCase().includes("face")) {
      injuryType = "Possible Stroke";
      severity = "high";
      category = "stroke";
    }
    
    // Generate appropriate steps based on the injury type
    const steps = generateStepsForInjury(injuryType, severity, category);
    
    return {
      results: [{
        injuryType,
        probability: 0.87,
        details: {
          severity,
          location: category === "head" ? "Head" : 
                   category === "eye" ? "Eyes" : 
                   category === "cardiac" ? "Chest" : 
                   category === "sprain" ? "Ankle" : "Arm/Hand",
          bloodLevel: category === "bleeding" ? "moderate" : 
                     category === "cut" ? "minimal" : "none",
          foreignObjects: category === "eye"
        }
      }],
      vectorSearchDetails: {
        similarDocuments: [
          {
            title: `${injuryType} Treatment Protocol`,
            similarity: 0.92
          },
          {
            title: "Emergency First Aid Guidelines",
            similarity: 0.85
          },
          {
            title: `Common ${category} injuries`,
            similarity: 0.78
          }
        ],
        contextChunks: 8
      },
      firstAidInstructions: {
        injuryType,
        severity,
        location: category === "head" ? "Head" : 
                 category === "eye" ? "Eyes" : 
                 category === "cardiac" ? "Chest" : 
                 category === "sprain" ? "Ankle" : "Arm/Hand",
        bloodLevel: category === "bleeding" ? "moderate" : 
                   category === "cut" ? "minimal" : "none",
        foreignObjects: category === "eye",
        steps,
        warning: severity === "high" ? "Seek immediate medical attention!" : 
                severity === "medium" ? "Consult with a healthcare professional as soon as possible." : 
                "Monitor the condition and seek medical attention if symptoms worsen.",
        note: "These instructions are based on current medical guidelines and are meant for temporary care until professional help is available.",
        sources: [
          "American Red Cross First Aid Guidelines",
          "Mayo Clinic Emergency Procedures",
          "National Institute for Health - First Aid Protocols"
        ],
        estimatedTime: "5-10 minutes"
      },
      processingTime: 1.2
    };
  };

  // Generate appropriate steps based on injury type
  const generateStepsForInjury = (injuryType: string, severity: "low" | "medium" | "high", category: InjuryTypeCategory) => {
    // In a real application, these would come from a medical database based on the specific injury
    if (category === "burn") {
      return [
        { id: 1, content: "Remove the source of the burn if it's safe to do so.", important: true },
        { id: 2, content: "Cool the burn with cool (not cold) running water for 10 to 15 minutes.", duration: "10-15 min", hasVideo: true, hasAudio: true },
        { id: 3, content: "Remove any jewelry or tight items from the burned area before swelling occurs.", important: true },
        { id: 4, content: "Cover the burn with a sterile, non-adhesive bandage or clean cloth.", hasVideo: true },
        { id: 5, content: "Do not apply butter, oil, ice, or fluffy cotton to the burn.", important: true }
      ];
    } else if (category === "bleeding") {
      return [
        { id: 1, content: "Apply direct pressure to the wound with a clean cloth or bandage.", important: true, hasVideo: true, hasAudio: true },
        { id: 2, content: "If blood soaks through, add another layer without removing the first.", hasVideo: true },
        { id: 3, content: "If possible, elevate the wound above the heart.", hasAudio: true },
        { id: 4, content: "If bleeding continues severely, apply pressure to the appropriate pressure point.", important: true, hasVideo: true },
        { id: 5, content: "Secure the dressing with a bandage once bleeding is controlled." }
      ];
    } else if (category === "fracture") {
      return [
        { id: 1, content: "Immobilize the injured area. Do not attempt to realign the bone.", important: true, hasVideo: true, hasAudio: true },
        { id: 2, content: "Apply a cold pack wrapped in cloth to reduce swelling and pain.", duration: "15-20 min", hasVideo: true },
        { id: 3, content: "If the person must be moved, stabilize the area with a makeshift splint.", important: true, hasVideo: true },
        { id: 4, content: "Treat for shock if necessary by laying the person flat with feet elevated.", hasAudio: true },
        { id: 5, content: "Seek immediate medical attention for proper diagnosis and treatment." }
      ];
    } else if (category === "cardiac") {
      return [
        { id: 1, content: "Call emergency services immediately.", important: true },
        { id: 2, content: "Have the person sit or lie in a comfortable position, typically with head and shoulders elevated.", hasVideo: true, hasAudio: true },
        { id: 3, content: "If the person is responsive and has prescribed medication like nitroglycerin, help them take it.", important: true },
        { id: 4, content: "If the person is unresponsive and not breathing normally, begin CPR if trained.", important: true, hasVideo: true, hasAudio: true },
        { id: 5, content: "If an AED is available, use it following the device instructions.", hasVideo: true }
      ];
    } else if (category === "stroke") {
      return [
        { id: 1, content: "Remember the acronym FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services.", important: true, hasVideo: true, hasAudio: true },
        { id: 2, content: "Note the time when symptoms first appeared.", important: true },
        { id: 3, content: "Do not give the person anything to eat or drink.", important: true },
        { id: 4, content: "If the person is unresponsive but breathing, place them in the recovery position.", hasVideo: true },
        { id: 5, content: "Stay with the person until emergency help arrives." }
      ];
    } else {
      // Default steps for other injuries
      return [
        { id: 1, content: "Assess the injury carefully without causing additional harm.", hasVideo: true },
        { id: 2, content: "Clean the affected area gently with mild soap and water if appropriate.", hasAudio: true },
        { id: 3, content: "Apply appropriate first aid based on the specific injury.", important: severity === "high" || severity === "medium", hasVideo: true },
        { id: 4, content: "Cover with a clean bandage if needed.", hasVideo: true },
        { id: 5, content: "Monitor for changes in condition and seek medical attention as needed." }
      ];
    }
  };

  if (!isProcessing) return null;

  return (
    <div className="bg-gray-50 border rounded-lg p-4 mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-texture opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${stage === 'complete' ? 'bg-green-100' : 'bg-blue-100'}`}>
            {stage === 'complete' ? (
              <Zap className="h-5 w-5 text-green-600" />
            ) : (
              <Brain className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pathway RAG Engine</h3>
            <p className="text-sm text-gray-500">Analyzing image and retrieving medical knowledge</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium capitalize text-gray-700">{stage} {stage !== 'complete' && '...'}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          
          <Progress 
            value={progress} 
            className={`h-2 ${stage === 'complete' ? 'bg-green-100' : 'bg-blue-100'}`} 
          />
          
          <div className="py-2 px-3 bg-gray-100 rounded-md max-h-24 overflow-y-auto text-xs font-mono">
            {predictionDetails.map((detail, index) => (
              <div key={index} className="py-0.5">
                {detail}
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <Database className="h-3 w-3 mr-1" />
              Vector DB Connected
            </Badge>
            
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              <Loader2 className={`h-3 w-3 mr-1 ${stage !== 'complete' ? 'animate-spin' : ''}`} />
              {stage === 'complete' ? 'Processing Complete' : 'Processing'}
            </Badge>
            
            {stage === 'complete' && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Results Ready
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
