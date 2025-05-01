import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { InjuryDetectionSystem } from "@/components/first-aid/InjuryDetectionSystem";
import { FirstAidInstructions } from "@/components/FirstAidInstructions";
import { EnhancedInjuryDetectionComponent } from "@/components/EnhancedInjuryDetection";
import { getEnhancedInjuryData } from "@/services/injuryAnalysisService";
import { PathwayApiResponse } from "@/types/firstAid";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Camera, Home, Thermometer, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InjuryAnalysisPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [apiResponse, setApiResponse] = useState<PathwayApiResponse | null>(null);
  
  const handleImageUpload = (image: File) => {
    setUploadedImage(image);
    setIsProcessing(true);
  };
  
  const handleAnalysisResult = (result: PathwayApiResponse) => {
    setApiResponse(result);
    setIsProcessing(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/app">Medical Assistant</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Injury Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Camera className="mr-2 h-5 w-5 text-aidify-blue" />
              Upload Injury Photo
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Take or upload a photo of the injury to receive first aid instructions. The clearer the image, 
              the more accurate our AI-powered analysis will be.
            </p>
            
            <ImageUploader
              onImageUpload={handleImageUpload}
              isProcessing={isProcessing}
            />

            {uploadedImage && !isProcessing && !apiResponse && (
              <div className="mt-6">
                <Button 
                  onClick={() => setIsProcessing(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium border border-blue-700 shadow-sm"
                >
                  Analyze with AI
                </Button>
              </div>
            )}
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {isProcessing && uploadedImage && (
            <InjuryDetectionSystem 
              isProcessing={isProcessing} 
              imageFile={uploadedImage}
              onResult={handleAnalysisResult} 
            />
          )}
          
          {apiResponse && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Thermometer className="mr-2 h-5 w-5 text-aidify-blue" />
                  Injury Assessment
                </h2>
                <EnhancedInjuryDetectionComponent 
                  data={getEnhancedInjuryData(apiResponse.results[0].injuryType)} 
                />
              </div>
              
              <FirstAidInstructions {...apiResponse.firstAidInstructions} />
            </>
          )}
          
          {!isProcessing && !apiResponse && (
            <div className="bg-gray-50 border rounded-lg p-8 text-center">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">AI-Powered Medical Analysis</h3>
              <p className="text-gray-500">
                Upload an image of an injury to receive first aid instructions using Google Cloud Vision AI and medical guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
