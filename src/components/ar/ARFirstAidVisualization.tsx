import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Layers, Maximize2, Minimize2 } from 'lucide-react';
import { FirstAidInstructionsProps } from '@/types/firstAid';
import { useToast } from "@/components/ui/use-toast";
import { detectBodyParts } from '@/lib/pose-detection';
import { getARInstructionsForInjury } from '@/lib/ar-first-aid-instructions';

interface ARFirstAidVisualizationProps {
  injuryType: string;
  severity: 'low' | 'medium' | 'high';
  bodyLocation?: string;
  firstAidSteps: Array<{
    id: number;
    content: string;
    important?: boolean;
    hasVideo?: boolean;
  }>;
  onClose: () => void;
}

const ARFirstAidVisualization: React.FC<ARFirstAidVisualizationProps> = ({
  injuryType,
  severity,
  bodyLocation,
  firstAidSteps,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [detectedParts, setDetectedParts] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Initialize AR camera stream
  useEffect(() => {
    const initCamera = async () => {
      try {
        if (!videoRef.current) return;
        
        const constraints = { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
          toast({
            title: "AR mode active",
            description: "Move the camera to align with the injured area",
          });
        };
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          variant: "destructive",
          title: "Camera access denied",
          description: "Please enable camera permissions to use AR mode",
        });
      }
    };
    
    initCamera();
    
    return () => {
      // Clean up video stream on component unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  // Body part detection and AR overlay rendering
  useEffect(() => {
    if (!isCameraReady || !canvasRef.current || !videoRef.current) return;
    
    let animationFrameId: number;
    let detectionInterval: NodeJS.Timeout;
    
    const detectAndRender = async () => {
      setIsInitialized(true);
      
      // Set up detection on an interval to improve performance
      detectionInterval = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const parts = await detectBodyParts(videoRef.current);
          setDetectedParts(parts);
        }
      }, 500); // Detect every 500ms
      
      const render = () => {
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;
          
          // Match canvas size to video
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          
          // Draw video frame
          ctx.drawImage(videoRef.current, 0, 0);
          
          // Get AR instructions for the current injury and step
          const currentStep = firstAidSteps[currentStepIndex];
          const arInstructions = getARInstructionsForInjury(
            injuryType, 
            bodyLocation || '', 
            detectedParts,
            currentStep
          );
          
          // Draw AR overlays based on detected body parts
          if (arInstructions && detectedParts.length > 0) {
            // Draw instruction overlays
            arInstructions.forEach(instruction => {
              const { x, y, type, text, color, size } = instruction;
              
              // Draw different overlay types (arrow, circle, etc)
              if (type === 'circle') {
                ctx.beginPath();
                ctx.arc(x, y, size || 30, 0, 2 * Math.PI);
                ctx.strokeStyle = color || '#FF4500';
                ctx.lineWidth = 3;
                ctx.stroke();
              } else if (type === 'arrow') {
                // Draw arrow to point to specific location
                const { fromX, fromY, toX, toY } = instruction;
                if (fromX && fromY && toX && toY) {
                  ctx.beginPath();
                  ctx.moveTo(fromX, fromY);
                  ctx.lineTo(toX, toY);
                  ctx.strokeStyle = color || '#FF4500';
                  ctx.lineWidth = 3;
                  ctx.stroke();
                  
                  // Arrow head
                  const angle = Math.atan2(toY - fromY, toX - fromX);
                  ctx.beginPath();
                  ctx.moveTo(toX, toY);
                  ctx.lineTo(
                    toX - 15 * Math.cos(angle - Math.PI / 6),
                    toY - 15 * Math.sin(angle - Math.PI / 6)
                  );
                  ctx.moveTo(toX, toY);
                  ctx.lineTo(
                    toX - 15 * Math.cos(angle + Math.PI / 6),
                    toY - 15 * Math.sin(angle + Math.PI / 6)
                  );
                  ctx.stroke();
                }
              }
              
              // Add text instruction
              if (text) {
                ctx.font = '18px Arial';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 4;
                ctx.strokeText(text, x, y - 40);
                ctx.fillText(text, x, y - 40);
              }
            });
          }
          
          // Draw instruction feedback
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(0, canvasRef.current.height - 100, canvasRef.current.width, 100);
          
          ctx.font = '20px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(
            `Step ${currentStepIndex + 1}/${firstAidSteps.length}: ${firstAidSteps[currentStepIndex].content.substring(0, 70)}${firstAidSteps[currentStepIndex].content.length > 70 ? '...' : ''}`, 
            20, 
            canvasRef.current.height - 60
          );
          
          ctx.font = '16px Arial';
          ctx.fillText(
            "Move camera to align with the injured area",
            20,
            canvasRef.current.height - 30
          );
        }
        
        animationFrameId = requestAnimationFrame(render);
      };
      
      render();
    };
    
    detectAndRender();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(detectionInterval);
    };
  }, [isCameraReady, injuryType, bodyLocation, firstAidSteps, currentStepIndex, detectedParts]);
  
  const toggleFullscreen = () => {
    const element = document.documentElement;
    
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  const nextStep = () => {
    if (currentStepIndex < firstAidSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="relative flex-1 overflow-hidden">
        {/* Video element (hidden but used for capture) */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className="hidden"
        />
        
        {/* Canvas for AR rendering */}
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
        
        {/* Loading state */}
        {!isInitialized && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
            <Camera className="h-16 w-16 animate-pulse mb-4" />
            <p className="text-xl font-medium">Initializing AR Mode...</p>
            <p className="text-sm opacity-70 mt-2">Please allow camera access</p>
          </div>
        )}
        
        {/* Controls overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <div className="text-white font-medium">
            AR First Aid: {injuryType}
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white">
            {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Step navigation */}
      <div className="bg-black text-white p-4 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStepIndex === 0}
          className="w-20"
        >
          Previous
        </Button>
        
        <div className="flex-1 text-center">
          <span className="font-medium">Step {currentStepIndex + 1} of {firstAidSteps.length}</span>
        </div>
        
        <Button 
          variant="default" 
          onClick={nextStep} 
          disabled={currentStepIndex === firstAidSteps.length - 1}
          className="w-20 bg-blue-600 hover:bg-blue-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ARFirstAidVisualization; 