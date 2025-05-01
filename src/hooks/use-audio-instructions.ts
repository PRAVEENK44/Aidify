import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Demo audio files for different first aid steps
const AUDIO_FILES = {
  burn: "/audio/burn-treatment.mp3",
  cut: "/audio/cut-treatment.mp3",
  fracture: "/audio/fracture-treatment.mp3",
  general: "/audio/general-first-aid.mp3",
  laceration: "/audio/cut-treatment.mp3", // Map lacerations to cut treatment
  abrasion: "/audio/cut-treatment.mp3" // Map abrasions to cut treatment
};

export function useAudioInstructions(injuryType?: string) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const [audioSrc, setAudioSrc] = useState<string>("");
  
  // Determine which audio file to use based on injury type
  useEffect(() => {
    let src = AUDIO_FILES.general;
    if (injuryType) {
      const normalizedType = injuryType.toLowerCase();
      
      // Check for specific injury types in our mapping
      for (const [key, value] of Object.entries(AUDIO_FILES)) {
        if (normalizedType.includes(key)) {
          src = value;
          break;
        }
      }
    }
    
    setAudioSrc(src);
    
    // Create audio element but don't load it yet
    audioRef.current = new Audio();
    
    // Add event listeners
    const handleEnded = () => {
      setIsAudioPlaying(false);
      toast({
        title: "Audio complete",
        description: "Audio instructions have finished playing.",
      });
    };
    
    const handleError = (e: Event) => {
      console.error("Audio playback error:", e);
      setIsAudioPlaying(false);
      toast({
        title: "Audio error",
        description: "Could not play audio instructions. Please try again.",
        variant: "destructive"
      });
    };
    
    audioRef.current.addEventListener("ended", handleEnded);
    audioRef.current.addEventListener("error", handleError);
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("error", handleError);
        audioRef.current = null;
      }
    };
  }, [injuryType, toast]);

  const playAudioInstructions = () => {
    if (!audioRef.current) {
      console.error("Audio element not initialized");
      toast({
        title: "Audio unavailable",
        description: "Audio instructions are not available at this time.",
        variant: "destructive"
      });
      return;
    }

    if (isAudioPlaying) {
      // Stop audio if it's already playing
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      toast({
        title: "Audio stopped",
        description: "Audio instructions have been stopped.",
      });
      return;
    }
    
    try {
      // Only set the src when the user interacts to play
      // This helps avoid issues with browser autoplay policy
      audioRef.current.src = audioSrc;
      
      // Set up a simpler success handler
      const handleSuccess = () => {
        setIsAudioPlaying(true);
        toast({
          title: "Audio playing",
          description: `Playing first aid instructions for ${injuryType || 'treatment'}.`,
        });
      };
      
      // Set up a load error handler
      const handleLoadError = () => {
        console.error("Failed to load audio file");
        // Fallback to simulated playback
        simulateAudioPlayback();
      };
      
      // Handle the load and play separately for better error handling
      audioRef.current.addEventListener('canplaythrough', () => {
        const playPromise = audioRef.current?.play();
        if (playPromise) {
          playPromise
            .then(handleSuccess)
            .catch(error => {
              console.error("Playback error:", error);
              
              // Browser autoplay policy error is typically DOMException: play() failed
              if (error.name === "NotAllowedError") {
                toast({
                  title: "Playback error",
                  description: "Audio couldn't play automatically. Please try again.",
                  variant: "destructive"
                });
              } else {
                // For other errors, try simulated playback
                simulateAudioPlayback();
              }
            });
        }
      }, { once: true });
      
      audioRef.current.addEventListener('error', handleLoadError, { once: true });
      
      // Start loading the audio
      audioRef.current.load();
      
    } catch (error) {
      console.error("Audio play error:", error);
      // Fallback to simulated playback
      simulateAudioPlayback();
    }
  };
  
  // Function to simulate audio playback when actual audio fails
  const simulateAudioPlayback = () => {
    try {
      // Try using the browser's Speech Synthesis API as a fallback
      const speechSynthesis = window.speechSynthesis;
      const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
      
      if (speechSynthesis && SpeechSynthesisUtterance) {
        // Create a speech synthesis utterance
        const message = new SpeechSynthesisUtterance();
        message.text = `First aid instructions for ${injuryType || 'general treatment'}. Please follow step-by-step instructions shown on screen carefully.`;
        message.rate = 0.9; // Slightly slower for clearer instructions
        message.pitch = 1;
        message.volume = 1;
        
        // Set up events
        message.onstart = () => {
          setIsAudioPlaying(true);
          toast({
            title: "Audio playing (Text-to-Speech)",
            description: `Playing first aid instructions for ${injuryType || 'treatment'}.`,
          });
        };
        
        message.onend = () => {
          setIsAudioPlaying(false);
          toast({
            title: "Audio complete",
            description: "Audio instructions have finished playing.",
          });
        };
        
        message.onerror = () => {
          setIsAudioPlaying(false);
          fallbackToToast();
        };
        
        // Play the speech
        speechSynthesis.speak(message);
        return;
      }
      
      // If speech synthesis is not available, fall back to toast
      fallbackToToast();
    } catch (error) {
      console.error("Speech synthesis error:", error);
      fallbackToToast();
    }
  };
  
  // Final fallback using just a toast notification
  const fallbackToToast = () => {
    // Fallback to toast notification if audio files don't exist
    toast({
      title: "Audio instructions",
      description: `Instructions for ${injuryType || 'first aid'} would play here.`,
    });
    
    // Simulate audio playback with timeout for demo
    setIsAudioPlaying(true);
    setTimeout(() => {
      setIsAudioPlaying(false);
      toast({
        title: "Audio complete",
        description: "Audio instructions have finished playing (simulated).",
      });
    }, 5000);
  };

  return {
    isAudioPlaying,
    playAudioInstructions
  };
}
