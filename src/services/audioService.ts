import { Step } from "@/types/firstAid";

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

class AudioService {
  private static instance: AudioService;
  private audio: HTMLAudioElement | null = null;
  private currentStep: number = -1;
  private steps: Step[] = [];
  private isPlaying: boolean = false;
  private onPlayCallback: ((stepIndex: number) => void) | null = null;
  private onStopCallback: (() => void) | null = null;

  private constructor() {
    // Initialize audio element
    this.audio = new Audio();
    
    // Set up event listeners
    this.audio.addEventListener('ended', this.handleAudioEnd.bind(this));
    this.audio.addEventListener('error', this.handleAudioError.bind(this));
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public setSteps(steps: Step[]): void {
    this.steps = steps;
  }

  public setCallbacks(onPlay: (stepIndex: number) => void, onStop: () => void): void {
    this.onPlayCallback = onPlay;
    this.onStopCallback = onStop;
  }

  public playStep(stepIndex: number): void {
    // If already playing, stop current audio
    if (this.isPlaying) {
      this.stopAudio();
    }

    // Check if step exists
    if (!this.steps[stepIndex]) {
      console.error("Invalid step index:", stepIndex);
      return;
    }

    try {
      const step = this.steps[stepIndex];
      this.currentStep = stepIndex;
      
      // Get audio URL based on step content
      const audioUrl = this.getAudioUrlForStep(step);
      
      if (!this.audio) {
        this.audio = new Audio(audioUrl);
        this.audio.addEventListener('ended', this.handleAudioEnd.bind(this));
        this.audio.addEventListener('error', this.handleAudioError.bind(this));
      } else {
        this.audio.src = audioUrl;
      }
      
      // Play the audio
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            if (this.onPlayCallback) {
              this.onPlayCallback(stepIndex);
            }
          })
          .catch(error => {
            console.error("Audio play error:", error);
            this.useFallbackSpeech(step.content);
          });
      }
    } catch (error) {
      console.error("Error setting up audio:", error);
      this.isPlaying = false;
    }
  }

  public playAllSteps(startingIndex: number = 0): void {
    if (startingIndex < 0 || startingIndex >= this.steps.length) {
      startingIndex = 0;
    }
    
    this.playStep(startingIndex);
  }

  public stopAudio(): void {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      
      if (this.onStopCallback) {
        this.onStopCallback();
      }
    }
    
    // Also stop any text-to-speech if active
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentStepIndex(): number {
    return this.currentStep;
  }

  private handleAudioEnd(): void {
    this.isPlaying = false;
    
    // Automatically play the next step if available
    if (this.currentStep < this.steps.length - 1) {
      setTimeout(() => {
        this.playStep(this.currentStep + 1);
      }, 1000); // 1 second pause between steps
    } else {
      // Reset if we reached the end
      this.currentStep = -1;
      if (this.onStopCallback) {
        this.onStopCallback();
      }
    }
  }

  private handleAudioError(error: Event): void {
    console.error("Audio error:", error);
    this.isPlaying = false;
    
    if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
      // Try text-to-speech as a fallback
      const step = this.steps[this.currentStep];
      this.useFallbackSpeech(step.content);
    }
  }

  private useFallbackSpeech(text: string): void {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        this.isPlaying = true;
        if (this.onPlayCallback && this.currentStep >= 0) {
          this.onPlayCallback(this.currentStep);
        }
      };
      
      utterance.onend = () => {
        this.handleAudioEnd();
      };
      
      utterance.onerror = () => {
        this.isPlaying = false;
        if (this.onStopCallback) {
          this.onStopCallback();
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  }

  private getAudioUrlForStep(step: Step): string {
    const content = step.content.toLowerCase();
    
    // Find matching keyword in the audio mapping
    for (const [keyword, url] of Object.entries(AUDIO_MAPPING)) {
      if (content.includes(keyword)) {
        return url;
      }
    }
    
    // Default audio if no keyword matches
    return AUDIO_MAPPING.default;
  }
}

export default AudioService; 