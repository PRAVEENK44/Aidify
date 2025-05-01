import { Clock, StopCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Step } from "@/types/firstAid";

interface CurrentStepProps {
  step: Step;
  playStepAudio: (stepIndex: number) => void;
  stepIndex: number;
  isAudioPlaying: boolean;
}

export function CurrentStep({ step, playStepAudio, stepIndex, isAudioPlaying }: CurrentStepProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-200",
      step.important 
        ? "bg-red-50 border-red-200" 
        : "bg-blue-50/50 border-blue-100"
    )}>
      <div className="flex justify-between items-center mb-3">
        <h5 className={cn(
          "font-medium flex items-center gap-2",
          step.important ? "text-red-700" : "text-blue-700"
        )}>
          Current Step
          {step.important && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Critical
            </span>
          )}
        </h5>
        {step.duration && (
          <span className="text-xs text-gray-600 flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3" />
            {step.duration}
          </span>
        )}
      </div>
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5",
          step.important 
            ? "bg-red-100 text-red-700" 
            : "bg-blue-100 text-blue-700"
        )}>
          {step.id}
        </div>
        <div className={cn(
          "text-gray-700",
          step.important && "font-medium text-red-700"
        )}>
          {step.content}
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 ml-10">
        <Button 
          size="sm" 
          variant="outline" 
          className={cn(
            "flex items-center gap-1.5 h-8 text-xs hover:bg-blue-50 transition-colors",
            step.important ? "border-red-200 text-red-700" : "border-blue-200 text-blue-700"
          )}
          onClick={() => playStepAudio(stepIndex)}
          disabled={isAudioPlaying}
        >
          <PlayCircle className="h-3.5 w-3.5" />
          Play Audio
        </Button>
        
        {isAudioPlaying && (
          <Button 
            size="sm" 
            variant="destructive" 
            className="flex items-center gap-1.5 h-8 text-xs"
            onClick={() => playStepAudio(stepIndex)}
          >
            <StopCircle className="h-3.5 w-3.5" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
