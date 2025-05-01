import { CheckCircle2, Volume2, PauseCircle, StopCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { FirstAidInstructionsProps } from "@/types/firstAid";
import { FirstAidHeader } from "@/components/first-aid/FirstAidHeader";
import { FirstAidAlerts } from "@/components/first-aid/FirstAidAlerts";
import { CurrentStep } from "@/components/first-aid/CurrentStep";
import { StepsList } from "@/components/first-aid/StepsList";
import { NoteAndSources } from "@/components/first-aid/NoteAndSources";
import { Disclaimer } from "@/components/first-aid/Disclaimer";
import { useStepAudio } from "@/hooks/use-step-audio";
import { useToast } from "@/hooks/use-toast";

export { type FirstAidInstructionsProps } from "@/types/firstAid";

export function FirstAidInstructions({
  injuryType,
  severity,
  location,
  bloodLevel,
  foreignObjects,
  steps,
  warning,
  note,
  sources,
  estimatedTime
}: FirstAidInstructionsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { isPlaying, playingStepIndex, playStep, playAllFromCurrent, stopAllAudio } = useStepAudio(steps);
  const { toast } = useToast();

  // Function to go to next step
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Function to go to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Auto-update current step index when audio moves to next step
  useEffect(() => {
    if (playingStepIndex !== null) {
      setCurrentStepIndex(playingStepIndex);
    }
  }, [playingStepIndex]);

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <FirstAidHeader 
        injuryType={injuryType}
        severity={severity}
        location={location}
        bloodLevel={bloodLevel}
        foreignObjects={foreignObjects}
      />
      
      <FirstAidAlerts 
        warning={warning}
        estimatedTime={estimatedTime}
      />
      
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">First Aid Instructions:</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-8"
              onClick={(e) => {
                e.stopPropagation();
                playAllFromCurrent(currentStepIndex);
              }}
              disabled={isPlaying}
              aria-label="Play All Instructions"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Play All
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1 h-8"
              onClick={(e) => {
                e.stopPropagation();
                stopAllAudio();
              }}
              disabled={!isPlaying}
              aria-label="Stop Audio"
            >
              <StopCircle className="h-3.5 w-3.5" />
              Stop
            </Button>
          </div>
        </div>
        
        <div className="pb-4 mb-4 border-b">
          <CurrentStep 
            step={steps[currentStepIndex]} 
            playStepAudio={playStep}
            isAudioPlaying={isPlaying && playingStepIndex === currentStepIndex}
            stepIndex={currentStepIndex}
          />
          
          <div className="flex justify-between mt-3">
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentStepIndex === 0}
              onClick={goToPreviousStep}
            >
              Previous
            </Button>
            <Button 
              size="sm"
              disabled={currentStepIndex === steps.length - 1}
              onClick={goToNextStep}
            >
              Next Step
            </Button>
          </div>
        </div>
        
        <h5 className="font-medium mb-2 text-sm">All Steps:</h5>
        <StepsList 
          steps={steps}
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
        />
        
        <NoteAndSources 
          note={note}
        />
      </div>
      
      <NoteAndSources 
        sources={sources}
      />
      
      <Disclaimer />
    </div>
  );
}
