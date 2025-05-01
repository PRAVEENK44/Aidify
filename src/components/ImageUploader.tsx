import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload: (image: File) => void;
  isProcessing: boolean;
}

export function ImageUploader({ onImageUpload, isProcessing }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setUsingCamera(true);
        toast({
          title: "Camera started",
          description: "Your camera is now active. Take a photo of the injury.",
        });
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera access or upload an image.");
      console.error("Error accessing camera:", err);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      setImage(file);
      
      // Create and set the preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      // Pass the image to parent component
      onImageUpload(file);
      
      // Stop the camera stream
      stopCamera();
      
      toast({
        title: "Photo captured",
        description: "Your photo has been successfully captured.",
      });
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setUsingCamera(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateImage = (file: File): boolean => {
    if (!file.type.match("image.*")) {
      setError("Please upload an image file (PNG, JPG, JPEG)");
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleImageChange = useCallback((file: File) => {
    if (!validateImage(file)) return;
    
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    onImageUpload(file);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  }, [handleImageChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearImage = () => {
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      
      {!usingCamera ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors text-center",
            dragActive ? "border-aidify-blue bg-blue-50" : "border-gray-300",
            previewUrl ? "bg-gray-50" : "bg-white"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!previewUrl ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Upload className="h-6 w-6 text-aidify-blue" />
              </div>
              <div>
                <p className="text-base font-medium">
                  Drag and drop an injury photo, or{" "}
                  <button 
                    type="button"
                    className="text-aidify-blue hover:text-aidify-blue/90 cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    browse
                  </button>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    ref={fileInputRef}
                  />
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG, JPEG up to 5MB
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="button" 
                  onClick={startCamera} 
                  disabled={isProcessing}
                  variant="outline"
                  className="flex gap-2"
                >
                  <Camera size={18} />
                  Take Photo with Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative mx-auto max-w-xs">
                <img
                  src={previewUrl}
                  alt="Injury Preview"
                  className="mx-auto max-h-64 rounded-lg"
                />
                {!isProcessing && (
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex justify-center">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-aidify-blue">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing injury...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Image uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 rounded-lg p-4 bg-gray-50">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={takePhoto}
              className="flex gap-2 bg-aidify-blue hover:bg-aidify-blue/90"
            >
              <Camera size={18} />
              Capture Photo
            </Button>
            <Button
              variant="outline"
              onClick={stopCamera}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {previewUrl && !isProcessing && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={clearImage}
            className="w-full sm:w-auto"
          >
            Upload a different image
          </Button>
        </div>
      )}
    </div>
  );
}
