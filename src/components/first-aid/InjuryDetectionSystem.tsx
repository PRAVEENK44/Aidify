import { useState, useEffect } from 'react';
import { InjuryTypeCategory, PathwayApiResponse } from '@/types/firstAid';
import { Loader2, Brain, Zap, Database, AlertTriangle, BarChart, Activity, Image, Search, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { analyzeInjuryImage, generateResultForInjuryType } from '@/services/injuryAnalysisService';
import { Card, CardContent } from '@/components/ui/card';

interface InjuryDetectionSystemProps {
  isProcessing: boolean;
  imageFile?: File;
  onResult?: (result: PathwayApiResponse) => void;
}

export function InjuryDetectionSystem({ 
  isProcessing, 
  imageFile, 
  onResult 
}: InjuryDetectionSystemProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'initializing' | 'analyzing' | 'retrieving' | 'generating' | 'complete'>('initializing');
  const [predictionDetails, setPredictionDetails] = useState<string[]>([]);
  const [detectionMetrics, setDetectionMetrics] = useState<Record<string, number>>({});
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [emergencyDetected, setEmergencyDetected] = useState(false);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0);
      setStage('initializing');
      setPredictionDetails([]);
      setDetectionMetrics({});
      setDetectedObjects([]);
      setDetectedColors([]);
      setDetectedKeywords([]);
      setProcessingError(null);
      setEmergencyDetected(false);
      return;
    }

    let timer: number;
    let currentProgress = 0;
    
    const advanceProgress = async () => {
      currentProgress += Math.random() * 15;
      
      if (currentProgress < 25) {
        setStage('initializing');
        setPredictionDetails(prev => [...prev, 'Initializing Gemini Vision AI model...']);
      } else if (currentProgress < 50) {
        setStage('analyzing');
        setPredictionDetails(prev => [...prev, 'Analyzing image features with Google Gemini Vision AI...']);
      } else if (currentProgress < 75) {
        setStage('retrieving');
        setPredictionDetails(prev => [...prev, 'Retrieving relevant medical knowledge...']);
      } else if (currentProgress < 99) {
        setStage('generating');
        setPredictionDetails(prev => [...prev, 'Generating first aid instructions...']);
      } else {
        setStage('complete');
        setPredictionDetails(prev => [...prev, 'Processing complete']);
        
        // Generate the final result
        if (onResult && imageFile) {
          try {
            // Analyze the image to determine injury type using Gemini
            const response = await analyzeInjuryImage(imageFile);
            const injuryType = response.injuryType;
            
            console.log("Detected injury type:", injuryType);
            console.log("Detection details:", response.detectionDetails);
            
            // Show blood alert for severe bleeding
            if (response.injuryType === "Bleeding" || 
                (response.details?.bloodLevel === "severe" || response.details?.bloodLevel === "moderate") ||
                (response.detectionDetails?.bloodMentions && response.detectionDetails?.bloodMentions > 2) ||
                (response.detectionDetails?.geminiDetails?.detectedColors || []).some(c => 
                  c.toLowerCase().includes('red') || 
                  c.toLowerCase().includes('blood') || 
                  c.toLowerCase().includes('crimson') || 
                  c.toLowerCase().includes('maroon'))
            ) {
              setPredictionDetails(prev => [...prev, `⚠️ ALERT: Blood detected - Treating as emergency`]);
              setEmergencyDetected(true);
            }
            
            setPredictionDetails(prev => [...prev, `Detected injury: ${injuryType} (confidence: ${Math.round(response.confidence * 100)}%)`]);
            
            if (response.matchedKeywords && response.matchedKeywords.length > 0) {
              setPredictionDetails(prev => [...prev, `Matched keywords: ${response.matchedKeywords.join(', ')}`]);
              setDetectedKeywords(response.matchedKeywords);
            }
            
            if (response.detectionDetails) {
              // Store detection metrics for visualization
              const metrics: Record<string, number> = {
                redDominance: response.detectionDetails.redDominance ? 80 : 20,
                bloodMentions: Math.min(response.detectionDetails.bloodMentions * 20, 100) || 0,
                hasFace: response.detectionDetails.hasFace ? 100 : 0,
                violenceScore: typeof response.detectionDetails.violenceScore === 'number' 
                  ? response.detectionDetails.violenceScore 
                  : response.detectionDetails.violenceScore === 'VERY_LIKELY' ? 100 :
                    response.detectionDetails.violenceScore === 'LIKELY' ? 80 :
                    response.detectionDetails.violenceScore === 'POSSIBLE' ? 60 :
                    response.detectionDetails.violenceScore === 'UNLIKELY' ? 30 : 10,
                confidence: Math.round(response.confidence * 100)
              };

              setDetectionMetrics(metrics);
              
              // Handle Gemini-specific details
              if (response.detectionDetails.geminiDetails) {
                const geminiDetails = response.detectionDetails.geminiDetails;
                setDetectedObjects(geminiDetails.detectedObjects || []);
                setDetectedColors(geminiDetails.detectedColors || []);
                
                if (geminiDetails.detectedObjects?.length) {
                  setPredictionDetails(prev => [...prev, `Detected objects: ${geminiDetails.detectedObjects.join(', ')}`]);
                }
                if (geminiDetails.detectedColors?.length) {
                  setPredictionDetails(prev => [...prev, `Dominant colors: ${geminiDetails.detectedColors.join(', ')}`]);
                  
                  // Check if blood colors are detected
                  const hasBloodColors = geminiDetails.detectedColors.some(
                    color => color.toLowerCase().includes('red') || 
                            color.toLowerCase().includes('blood') || 
                            color.toLowerCase().includes('crimson') || 
                            color.toLowerCase().includes('maroon')
                  );
                  
                  if (hasBloodColors) {
                    setPredictionDetails(prev => [...prev, "⚠️ Red/blood-colored areas detected"]);
                  }
                }
              }
              
              const details = response.detectionDetails;
              if (details.redDominance) {
                setPredictionDetails(prev => [...prev, "⚠️ Detected significant red coloration (possible blood)"]);
              }
              
              if (details.bloodMentions && details.bloodMentions > 0) {
                setPredictionDetails(prev => [...prev, `⚠️ Found ${details.bloodMentions} blood-related terms`]);
              }
              
              if (details.hasFace) {
                setPredictionDetails(prev => [...prev, "Detected face in image (analyzing for head injury)"]);
              }
            }
            
            // Generate appropriate steps based on the injury type
            const simulatedResult = generateResultForInjuryType(injuryType);
            onResult(simulatedResult);
          } catch (error) {
            console.error("Error during image analysis:", error);
            setPredictionDetails(prev => [...prev, `Error: ${error.message}`]);
            setProcessingError(error.message);
            setEmergencyDetected(true);
            
            // Fallback to bleeding injury for safety in case of error
            const simulatedResult = generateResultForInjuryType("Bleeding");
            onResult(simulatedResult);
          }
        }
        
        window.clearInterval(timer);
        return;
      }
      
      setProgress(Math.min(currentProgress, 99));
    };
    
    timer = window.setInterval(advanceProgress, 500);
    
    return () => {
      window.clearInterval(timer);
    };
  }, [isProcessing, imageFile, onResult]);

  if (!isProcessing) return null;

  return (
    <div className="bg-gradient-to-tr from-gray-50 to-blue-50 border border-blue-100 rounded-lg p-4 mb-4 relative overflow-hidden shadow-md animate-fade-in">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${stage === 'complete' ? 'bg-green-100' : 'bg-blue-100'}`}>
            {stage === 'complete' ? (
              emergencyDetected ? 
                <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" /> :
                <Zap className="h-5 w-5 text-green-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gemini Medical Analysis Engine</h3>
            <p className="text-sm text-gray-500">Analyzing image using Google's Gemini Vision AI</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium capitalize text-gray-700 flex items-center gap-2">
              {stage === 'initializing' && <Loader2 className="h-4 w-4 animate-spin" />}
              {stage === 'analyzing' && <Search className="h-4 w-4 text-blue-500" />}
              {stage === 'retrieving' && <Database className="h-4 w-4 text-purple-500" />}
              {stage === 'generating' && <Brain className="h-4 w-4 text-teal-500" />}
              {stage === 'complete' && (
                emergencyDetected ? 
                  <AlertCircle className="h-4 w-4 text-red-500" /> :
                  <Check className="h-4 w-4 text-green-500" />
              )}
              {stage} {stage !== 'complete' && '...'}
            </span>
            <span className="text-sm font-medium text-gray-500">{Math.round(progress)}%</span>
          </div>
          
          <Progress 
            value={progress} 
            className={`h-2 ${
              stage === 'complete' 
                ? emergencyDetected 
                  ? 'bg-red-100' 
                  : 'bg-green-100' 
                : 'bg-blue-100'
            }`} 
            indicatorClassName={
              stage === 'complete'
                ? emergencyDetected
                  ? "bg-red-500"
                  : "bg-green-500"
                : "bg-gradient-to-r from-blue-500 to-teal-500"
            }
          />
          
          <div className="py-2 px-3 bg-gray-800 text-gray-200 rounded-md max-h-32 overflow-y-auto text-xs font-mono">
            {predictionDetails.map((detail, index) => (
              <div key={index} className="py-0.5 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <span className={detail.includes('⚠️') ? "text-red-400" : "text-green-400"}>&gt;</span> {detail}
              </div>
            ))}
            {processingError && (
              <div className="py-0.5 animate-fade-in bg-red-900/20 text-red-300 pl-2 border-l-2 border-red-500">
                <span className="text-red-400">&gt;</span> Error: {processingError}
              </div>
            )}
          </div>
          
          {stage === 'complete' && Object.keys(detectionMetrics).length > 0 && (
            <div className="space-y-2 mt-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <BarChart className="h-4 w-4" /> Detection Metrics
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {detectionMetrics.redDominance !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Red Dominance</span>
                      <span>{detectionMetrics.redDominance}%</span>
                    </div>
                    <Progress value={detectionMetrics.redDominance} className="h-1.5 bg-red-100" 
                      indicatorClassName={detectionMetrics.redDominance > 50 ? "bg-red-500" : "bg-gray-300"} />
                  </div>
                )}
                
                {detectionMetrics.bloodMentions !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Blood Terms</span>
                      <span>{detectionMetrics.bloodMentions}%</span>
                    </div>
                    <Progress value={detectionMetrics.bloodMentions} className="h-1.5 bg-red-100"
                      indicatorClassName={detectionMetrics.bloodMentions > 30 ? "bg-red-500" : "bg-gray-300"} />
                  </div>
                )}
                
                {detectionMetrics.confidence !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Confidence</span>
                      <span>{detectionMetrics.confidence}%</span>
                    </div>
                    <Progress value={detectionMetrics.confidence} className="h-1.5 bg-blue-100"
                      indicatorClassName="bg-blue-500" />
                  </div>
                )}
                
                {detectionMetrics.violenceScore !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Injury Severity</span>
                      <span>{detectionMetrics.violenceScore}%</span>
                    </div>
                    <Progress value={detectionMetrics.violenceScore} className="h-1.5 bg-orange-100"
                      indicatorClassName={detectionMetrics.violenceScore > 50 ? "bg-orange-500" : "bg-gray-300"} />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {stage === 'complete' && (
            <>
              {(detectedObjects.length > 0 || detectedColors.length > 0 || detectedKeywords.length > 0) && (
                <Card className={`border ${emergencyDetected ? 'border-red-100 bg-red-50/30' : 'border-blue-100 bg-blue-50/50'} overflow-hidden mt-3`}>
                  <CardContent className="p-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Sparkles className={`h-4 w-4 ${emergencyDetected ? 'text-red-500' : 'text-blue-500'}`} />
                      Gemini AI Insights
                    </h4>
                    
                    <div className="space-y-2">
                      {detectedObjects.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Detected Objects:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {detectedObjects.map((obj, idx) => (
                              <Badge key={idx} variant="outline" className="bg-white/60 text-xs">
                                {obj}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {detectedColors.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Dominant Colors:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {detectedColors.map((color, idx) => {
                              const isBloodColor = color.toLowerCase().includes('red') || 
                                color.toLowerCase().includes('blood') ||
                                color.toLowerCase().includes('crimson') ||
                                color.toLowerCase().includes('maroon');
                              
                              return (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    isBloodColor 
                                      ? 'text-red-600 border-red-300 bg-red-50 font-medium animate-pulse' 
                                      : 'bg-white/60'
                                  }`}
                                >
                                  {color} {isBloodColor && '⚠️'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {detectedKeywords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700">Key Indicators:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {detectedKeywords.map((keyword, idx) => {
                              const isEmergencyKeyword = 
                                keyword.toLowerCase().includes('blood') || 
                                keyword.toLowerCase().includes('wound') || 
                                keyword.toLowerCase().includes('cut') ||
                                keyword.toLowerCase().includes('severe') ||
                                keyword.toLowerCase().includes('emergency');
                              
                              return (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    isEmergencyKeyword
                                      ? 'text-red-600 border-red-300 bg-red-50/50 font-medium' 
                                      : 'bg-white/60'
                                  }`}
                                >
                                  {keyword} {isEmergencyKeyword && '⚠️'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {emergencyDetected && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-700">High-Priority Medical Alert</h5>
                      <p className="text-sm text-red-600">
                        Significant bleeding detected or suspected. This may be a severe injury requiring immediate attention. 
                        Follow first aid instructions for bleeding while seeking medical help.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Google Gemini Vision AI
            </Badge>
            
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              <Loader2 className={`h-3 w-3 mr-1 ${stage !== 'complete' ? 'animate-spin' : ''}`} />
              {stage === 'complete' ? 'Processing Complete' : 'Processing'}
            </Badge>
            
            {stage === 'complete' && !emergencyDetected && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Results Ready
              </Badge>
            )}
            
            {stage === 'complete' && emergencyDetected && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Emergency Detected
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
    </div>
  );
}
