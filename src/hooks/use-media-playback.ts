import { useState, useRef, useEffect } from "react";
import { Step } from "@/types/firstAid";
import { useToast } from "@/hooks/use-toast";

// Map of sample audio files for different first aid steps
const AUDIO_MAPPING = {
  pressure: "/audio/stop-bleeding.mp3",
  bleeding: "/audio/stop-bleeding.mp3",
  burn: "/audio/treat-burns.mp3",
  cool: "/audio/treat-burns.mp3",
  bandage: "/audio/apply-bandage.mp3",
  cover: "/audio/apply-bandage.mp3",
  cpr: "/audio/perform-cpr.mp3",
  splint: "/audio/apply-splint.mp3",
  immobilize: "/audio/immobilize-injury.mp3",
  choking: "/audio/choking-treatment.mp3",
  stroke: "/audio/stroke-assessment.mp3",
  ice: "/audio/apply-ice.mp3",
  clean: "/audio/clean-wound.mp3",
  wash: "/audio/clean-wound.mp3",
  elevate: "/audio/elevate-injury.mp3",
  rest: "/audio/rest-injury.mp3",
  compress: "/audio/compression.mp3",
  default: "/audio/general-firstaid.mp3"
};

export function useMediaPlayback(steps: Step[]) {
  const [activeAudio, setActiveAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Placeholder function for video playback (required by interface but not used)
   */
  const playStepVideo = (stepIndex: number) => {
    toast({
      title: "Video playback removed",
      description: "Video functionality has been replaced with automatic audio instructions.",
    });
  };

  /**
   * Plays audio for the specified step
   */
  const playStepAudio = (stepIndex: number) => {
    const step = steps[stepIndex];
    
    // If current audio is playing, stop it
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setIsPlaying(false);
      setActiveAudio(null);
      
      // Show a toast notification that audio has been stopped
      toast({
        title: "Audio stopped",
        description: "Audio instructions have been stopped.",
      });
      
      // Immediately return to prevent starting playback again
      return;
    }
    
    // Mark step as active
    setActiveAudio(stepIndex);
    
    try {
      // Get appropriate audio URL based on the step content
      const audioUrl = getAudioUrlForStep(step);
      
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }
      
      // Set up event handlers
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setActiveAudio(null);
      };
      
      audioRef.current.onerror = () => {
        console.error("Audio playback error");
        setIsPlaying(false);
        setActiveAudio(null);
        
        // Fallback to text-to-speech if available
        if (window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(step.content);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          speechSynthesis.speak(utterance);
          
          toast({
            title: "Using text-to-speech",
            description: "Audio file couldn't be played, using text-to-speech instead.",
          });
        } else {
          // Show error toast if text-to-speech is also not available
          toast({
            title: "Audio unavailable",
            description: "Could not play audio for this step.",
            variant: "destructive"
          });
        }
      };
      
      // Play the audio
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.then(() => {
          setIsPlaying(true);
          toast({
            title: `Now playing audio for step ${step.id}`,
            description: "Listen carefully to the instructions.",
          });
        }).catch(error => {
          console.error("Audio play error:", error);
          
          // Try using text-to-speech as fallback
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(step.content);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
            
            setIsPlaying(true);
            toast({
              title: "Using text-to-speech",
              description: "Using text-to-speech for audio instructions.",
            });
          } else {
            setIsPlaying(false);
            setActiveAudio(null);
            
            toast({
              title: "Audio playback error",
              description: "Could not play audio instructions. Please read the text carefully.",
              variant: "destructive"
            });
          }
        });
      }
    } catch (error) {
      console.error("Error setting up audio:", error);
      
      // Fallback for demo/development
      toast({
        title: `Audio for step ${step.id}`,
        description: `Audio instructions: ${step.content.substring(0, 80)}...`,
      });
      
      // Simulate audio playing state for UI consistency
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
        setActiveAudio(null);
      }, 3000);
    }
  };

  /**
   * Helper function to get appropriate audio URL based on step content
   */
  const getAudioUrlForStep = (step: Step): string => {
    const content = step.content.toLowerCase();
    
    // Find matching keyword in the audio mapping
    for (const [keyword, url] of Object.entries(AUDIO_MAPPING)) {
      if (content.includes(keyword)) {
        return url;
      }
    }
    
    // Default audio if no keyword matches
    return AUDIO_MAPPING.default;
  };

  return {
    playStepVideo,
    playStepAudio,
    isPlaying,
    activeAudio
  };
}
