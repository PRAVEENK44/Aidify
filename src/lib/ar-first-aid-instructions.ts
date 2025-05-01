import { mapLocationToBodyParts } from './pose-detection';

// Types for AR instructions
export interface ARInstruction {
  type: 'circle' | 'arrow' | 'text' | 'overlay';
  x: number;
  y: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
  text?: string;
  color?: string;
  size?: number;
  rotation?: number;
  duration?: number;
  animation?: 'pulse' | 'fade' | 'blink';
}

// Mapping of injury types to AR instruction templates
const injuryInstructionTemplates: Record<string, (bodyLocation: string, step: any) => ARInstruction[]> = {
  // Burns
  'burn': (bodyLocation, step) => {
    // Instructions specific to burn treatment
    if (step.content.includes('cool') || step.content.includes('water')) {
      return [{
        type: 'circle',
        x: 0, y: 0, // These will be replaced with actual coordinates
        color: '#00A3FF',
        size: 40,
        text: 'Apply cool water here',
        animation: 'pulse'
      }];
    } else if (step.content.includes('bandage') || step.content.includes('cover')) {
      return [{
        type: 'circle',
        x: 0, y: 0,
        color: '#FFFFFF',
        size: 45,
        text: 'Cover burn with sterile bandage'
      }];
    }
    
    return [{
      type: 'circle',
      x: 0, y: 0,
      color: '#FF4500',
      size: 35,
      text: 'Treatment area'
    }];
  },
  
  // Cuts and lacerations
  'cut': (bodyLocation, step) => {
    if (step.content.includes('pressure') || step.content.includes('bleeding')) {
      return [{
        type: 'circle',
        x: 0, y: 0,
        color: '#FF0000',
        size: 35,
        text: 'Apply direct pressure here',
        animation: 'pulse'
      }];
    } else if (step.content.includes('clean') || step.content.includes('wash')) {
      return [{
        type: 'circle',
        x: 0, y: 0,
        color: '#00A3FF',
        size: 40,
        text: 'Clean wound area'
      }];
    } else if (step.content.includes('bandage') || step.content.includes('cover')) {
      return [{
        type: 'circle',
        x: 0, y: 0,
        color: '#FFFFFF',
        size: 45,
        text: 'Apply bandage here'
      }];
    }
    
    return [{
      type: 'circle',
      x: 0, y: 0,
      color: '#FF4500',
      size: 35,
      text: 'Wound area'
    }];
  },
  
  // Fractures
  'fracture': (bodyLocation, step) => {
    if (step.content.includes('immobilize') || step.content.includes('splint')) {
      return [
        {
          type: 'arrow',
          x: 0, y: 0, // Target point
          fromX: 0, fromY: 0, // Will be calculated
          toX: 0, toY: 0, // Will be calculated
          color: '#FFBF00',
          text: 'Immobilize above joint'
        },
        {
          type: 'arrow',
          x: 0, y: 0, // Target point
          fromX: 0, fromY: 0, // Will be calculated
          toX: 0, toY: 0, // Will be calculated
          color: '#FFBF00',
          text: 'Immobilize below joint'
        }
      ];
    } else if (step.content.includes('elevate')) {
      return [{
        type: 'arrow',
        x: 0, y: 0,
        fromX: 0, fromY: 0,
        toX: 0, toY: 0,
        color: '#00A3FF',
        text: 'Elevate in this direction'
      }];
    }
    
    return [{
      type: 'circle',
      x: 0, y: 0,
      color: '#FF0000',
      size: 50,
      text: 'Suspected fracture location'
    }];
  },
  
  // Sprains
  'sprain': (bodyLocation, step) => {
    if (step.content.includes('ice') || step.content.includes('cold')) {
      return [{
        type: 'circle',
        x: 0, y: 0,
        color: '#00A3FF',
        size: 40,
        text: 'Apply ice here',
        animation: 'pulse'
      }];
    } else if (step.content.includes('compression') || step.content.includes('wrap')) {
      return [{
        type: 'circle',
        x: 0, y: 0,
        color: '#FFFFFF',
        size: 45,
        text: 'Apply compression wrap'
      }];
    } else if (step.content.includes('elevate')) {
      return [{
        type: 'arrow',
        x: 0, y: 0,
        fromX: 0, fromY: 0,
        toX: 0, toY: 0,
        color: '#00A3FF',
        text: 'Elevate in this direction'
      }];
    }
    
    return [{
      type: 'circle',
      x: 0, y: 0,
      color: '#FFBF00',
      size: 40,
      text: 'Injured area'
    }];
  },
  
  // Add more injury types as needed...
  'default': (bodyLocation, step) => {
    // Generic instructions for any injury type
    return [{
      type: 'circle',
      x: 0, y: 0,
      color: '#FF4500',
      size: 35,
      text: 'Treatment area'
    }];
  }
};

/**
 * Get AR instructions based on injury type, body location, and detected body parts
 */
export const getARInstructionsForInjury = (
  injuryType: string,
  bodyLocation: string,
  detectedParts: any[],
  currentStep: any
): ARInstruction[] => {
  // Normalize injury type for template lookup
  const normalizedType = injuryType.toLowerCase();
  let templateKey = 'default';
  
  // Find the matching template
  Object.keys(injuryInstructionTemplates).forEach(key => {
    if (normalizedType.includes(key)) {
      templateKey = key;
    }
  });
  
  // Get template function
  const templateFn = injuryInstructionTemplates[templateKey] || injuryInstructionTemplates['default'];
  
  // Get base instructions from template
  const baseInstructions = templateFn(bodyLocation, currentStep);
  
  // Map the instructions to actual body part coordinates
  return mapInstructionsToBodyParts(baseInstructions, bodyLocation, detectedParts);
};

/**
 * Map instruction templates to actual body part coordinates
 */
const mapInstructionsToBodyParts = (
  instructions: ARInstruction[],
  bodyLocation: string,
  detectedParts: any[]
): ARInstruction[] => {
  if (detectedParts.length === 0) {
    return [];
  }
  
  // Get relevant body parts for this location
  const relevantPartNames = mapLocationToBodyParts(bodyLocation);
  
  // Filter detected parts to only include relevant ones
  const relevantParts = detectedParts.filter(part => {
    // Check if the part name or region is in our list of relevant parts
    return (
      relevantPartNames.includes(part.name?.toUpperCase()) || 
      (part.region && relevantPartNames.includes(part.region))
    );
  });
  
  if (relevantParts.length === 0) {
    // Fallback to all detected parts if no relevant parts were found
    relevantParts.push(...detectedParts);
  }
  
  // Calculate a center point for all relevant parts
  const centerX = relevantParts.reduce((sum, part) => sum + part.x, 0) / relevantParts.length;
  const centerY = relevantParts.reduce((sum, part) => sum + part.y, 0) / relevantParts.length;
  
  // Map instructions to the detected body parts
  return instructions.map(instruction => {
    const mappedInstruction = { ...instruction };
    
    // Set the center point
    mappedInstruction.x = centerX;
    mappedInstruction.y = centerY;
    
    // For arrows, calculate appropriate from/to points
    if (instruction.type === 'arrow') {
      // Example: arrows pointing to/from the center
      const radius = instruction.size || 50;
      const angle = Math.random() * Math.PI * 2; // Random angle for demo
      
      mappedInstruction.fromX = centerX + Math.cos(angle) * radius * 2;
      mappedInstruction.fromY = centerY + Math.sin(angle) * radius * 2;
      mappedInstruction.toX = centerX;
      mappedInstruction.toY = centerY;
      
      // Special case for elevation instructions
      if (instruction.text?.includes('elevate')) {
        mappedInstruction.fromX = centerX;
        mappedInstruction.fromY = centerY;
        mappedInstruction.toX = centerX;
        mappedInstruction.toY = centerY - 100; // Point upward
      }
    }
    
    return mappedInstruction;
  });
}; 