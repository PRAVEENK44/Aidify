import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

// Body part indices for PoseNet model
const BODY_PARTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

// Region definitions for higher-level body areas
const BODY_REGIONS = {
  HEAD: ['NOSE', 'LEFT_EYE', 'RIGHT_EYE', 'LEFT_EAR', 'RIGHT_EAR'],
  CHEST: ['LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_HIP', 'RIGHT_HIP'],
  LEFT_ARM: ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST'],
  RIGHT_ARM: ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'],
  LEFT_LEG: ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE'],
  RIGHT_LEG: ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'],
};

let detector: poseDetection.PoseDetector | null = null;

/**
 * Initialize the pose detector model
 */
const initializeDetector = async (): Promise<poseDetection.PoseDetector> => {
  if (detector) return detector;
  
  // Use the MoveNet model for faster inference on mobile devices
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
  };
  
  detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
};

/**
 * Detect body parts from an image or video element
 */
export const detectBodyParts = async (
  imageElement: HTMLImageElement | HTMLVideoElement
): Promise<any[]> => {
  try {
    const detector = await initializeDetector();
    
    // Run inference
    const poses = await detector.estimatePoses(imageElement, {
      flipHorizontal: false,
      maxPoses: 1,
    });
    
    if (poses && poses.length > 0) {
      // Extract keypoints with additional metadata
      const enrichedParts = poses[0].keypoints.map(keypoint => {
        // Find the region this keypoint belongs to
        const regionName = Object.entries(BODY_REGIONS).find(([_, parts]) => 
          parts.includes(keypoint.name as keyof typeof BODY_PARTS)
        )?.[0] || null;
        
        return {
          ...keypoint,
          region: regionName,
        };
      });
      
      // Add virtual points for better region targeting
      // For example, calculate center points of regions like chest
      if (enrichedParts.length > 0) {
        const leftShoulder = enrichedParts.find(p => p.name === 'left_shoulder');
        const rightShoulder = enrichedParts.find(p => p.name === 'right_shoulder');
        const leftHip = enrichedParts.find(p => p.name === 'left_hip');
        const rightHip = enrichedParts.find(p => p.name === 'right_hip');
        
        // Add chest center point if shoulders and hips are detected
        if (leftShoulder && rightShoulder && leftHip && rightHip) {
          const chestCenter = {
            name: 'chest_center',
            x: (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4,
            y: (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4,
            score: (leftShoulder.score + rightShoulder.score + leftHip.score + rightHip.score) / 4,
            region: 'CHEST',
          };
          enrichedParts.push(chestCenter);
        }
        
        // Add abdomen center point
        if (leftHip && rightHip) {
          const abdomenCenter = {
            name: 'abdomen_center',
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2,
            score: (leftHip.score + rightHip.score) / 2,
            region: 'ABDOMEN',
          };
          enrichedParts.push(abdomenCenter);
        }
      }
      
      return enrichedParts;
    }
    
    return [];
  } catch (error) {
    console.error('Error detecting body parts:', error);
    return [];
  }
};

/**
 * Map a descriptive body location to the corresponding body parts and regions
 */
export const mapLocationToBodyParts = (location: string): string[] => {
  const locationMap: Record<string, string[]> = {
    'head': ['HEAD', 'NOSE', 'LEFT_EYE', 'RIGHT_EYE'],
    'face': ['HEAD', 'NOSE', 'LEFT_EYE', 'RIGHT_EYE'],
    'arm': ['LEFT_ARM', 'RIGHT_ARM'],
    'hand': ['LEFT_WRIST', 'RIGHT_WRIST'],
    'leg': ['LEFT_LEG', 'RIGHT_LEG'],
    'foot': ['LEFT_ANKLE', 'RIGHT_ANKLE'],
    'chest': ['CHEST'],
    'abdomen': ['ABDOMEN'],
    'knee': ['LEFT_KNEE', 'RIGHT_KNEE'],
    'ankle': ['LEFT_ANKLE', 'RIGHT_ANKLE'],
    'wrist': ['LEFT_WRIST', 'RIGHT_WRIST'],
    'shoulder': ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
    'elbow': ['LEFT_ELBOW', 'RIGHT_ELBOW'],
  };
  
  // Normalize input
  const normalizedLocation = location.toLowerCase();
  
  // Try exact matches
  for (const [key, parts] of Object.entries(locationMap)) {
    if (normalizedLocation.includes(key)) {
      return parts;
    }
  }
  
  // Default to full body if no match
  return Object.values(locationMap).flat();
}; 