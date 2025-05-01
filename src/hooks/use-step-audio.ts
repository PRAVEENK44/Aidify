import { useState, useEffect } from 'react';
import { Step } from '@/types/firstAid';
import { useToast } from '@/hooks/use-toast';
import AudioService from '@/services/audioService';

export function useStepAudio(steps: Step[]) {
  const [playingStepIndex, setPlayingStepIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioService = AudioService.getInstance();
  const { toast } = useToast();

  useEffect(() => {
    // Setup audio service with steps
    audioService.setSteps(steps);
    
    // Setup callbacks
    audioService.setCallbacks(
      // onPlay callback
      (stepIndex: number) => {
        setPlayingStepIndex(stepIndex);
        setIsPlaying(true);
        toast({
          title: `Playing audio for step ${steps[stepIndex]?.id || stepIndex + 1}`,
          description: "Listen carefully to the instructions.",
        });
      },
      // onStop callback
      () => {
        setPlayingStepIndex(null);
        setIsPlaying(false);
        toast({
          title: "Audio stopped",
          description: "Audio instructions have been stopped.",
        });
      }
    );

    // Cleanup on unmount
    return () => {
      audioService.stopAudio();
    };
  }, [steps, toast, audioService]);

  // Function to play a specific step
  const playStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      console.error("Invalid step index:", stepIndex);
      return;
    }

    if (isPlaying && playingStepIndex === stepIndex) {
      // Stop if already playing this step
      audioService.stopAudio();
    } else {
      // Play the step
      audioService.playStep(stepIndex);
    }
  };

  // Function to play all steps from current step
  const playAllFromCurrent = (currentStepIndex: number = 0) => {
    audioService.playAllSteps(currentStepIndex);
  };

  // Function to stop all audio
  const stopAllAudio = () => {
    audioService.stopAudio();
  };

  return {
    playStep,
    playAllFromCurrent,
    stopAllAudio,
    isPlaying,
    playingStepIndex
  };
} 