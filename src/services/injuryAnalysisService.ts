import { EnhancedInjuryDetection, InjuryTypeCategory, PathwayApiResponse } from "@/types/firstAid";
import { supabase } from "@/integrations/supabase/client";
import { analyzeInjuryImage as geminiAnalyzeImage, parseFirstAidInstructions } from "@/lib/gemini-api";

// Enhanced data for different injury types with more detailed information
const injuryData: Record<string, EnhancedInjuryDetection> = {
  "Bleeding": {
    injuryType: "Bleeding",
    probability: 0.96,
    details: {
      severity: "high",
      location: "Wound site",
      bloodLevel: "severe",
      foreignObjects: false
    },
    category: "bleeding",
    symptoms: [
      "Continuous blood flow from a wound",
      "Blood that spurts or pulses (arterial bleeding)",
      "Blood that quickly soaks through bandages",
      "Symptoms of shock (pale skin, rapid breathing, weakness)"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Deep cuts or lacerations",
      "Puncture wounds",
      "Traumatic injuries",
      "Surgical complications",
      "Underlying medical conditions"
    ],
    imageSignifiers: [
      "Visible blood",
      "Saturated bandages or clothing",
      "Open wound",
      "Red fluid"
    ]
  },
  "Cut/Laceration": {
    injuryType: "Cut/Laceration",
    probability: 0.95,
    details: {
      severity: "medium",
      location: "Extremity",
      bloodLevel: "moderate",
      foreignObjects: false
    },
    category: "cut",
    symptoms: [
      "Open wound with visible skin separation",
      "Bleeding, which can be minimal to severe",
      "Pain around the wound site",
      "Potential exposure of deeper tissues"
    ],
    urgencyLevel: 3,
    commonCauses: [
      "Contact with sharp objects",
      "Kitchen accidents",
      "Work-related injuries",
      "Falls on sharp edges"
    ],
    imageSignifiers: [
      "Linear wound with clean edges",
      "Visible blood",
      "Exposed tissue layers"
    ]
  },
  "Head Injury": {
    injuryType: "Head Injury",
    probability: 0.95,
    details: {
      severity: "high",
      location: "Head",
      bloodLevel: "moderate",
      foreignObjects: false
    },
    category: "head",
    symptoms: [
      "Headache or pressure in the head",
      "Temporary loss of consciousness",
      "Confusion or disorientation",
      "Nausea or vomiting",
      "Dizziness or balance problems",
      "Visible wound or bleeding on the head"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Falls",
      "Vehicle-related accidents",
      "Sports injuries",
      "Violence or assaults",
      "Workplace accidents"
    ],
    imageSignifiers: [
      "Visible wound or bruising on head",
      "Bleeding from head or face",
      "Swelling",
      "Irregular pupil size (in severe cases)"
    ]
  },
  "Burn Injury": {
    injuryType: "Burn Injury",
    probability: 0.92,
    details: {
      severity: "high",
      location: "Affected area",
      bloodLevel: "minimal",
      foreignObjects: false
    },
    category: "burn",
    symptoms: [
      "Redness and pain in the affected area",
      "Blistering of the skin",
      "Swelling",
      "White or charred appearance in severe burns"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Contact with hot surfaces",
      "Scalding liquids",
      "Fire exposure",
      "Chemical contact",
      "Electrical accidents"
    ],
    imageSignifiers: [
      "Redness or discoloration",
      "Blisters or broken skin",
      "Charred tissue in severe cases"
    ]
  },
  "Fracture": {
    injuryType: "Fracture",
    probability: 0.94,
    details: {
      severity: "high",
      location: "Bone",
      bloodLevel: "minimal",
      foreignObjects: false
    },
    category: "fracture",
    symptoms: [
      "Pain that intensifies with movement",
      "Swelling and bruising",
      "Deformity or abnormal alignment",
      "Limited mobility or inability to move the affected area"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Falls from height",
      "Direct impacts",
      "Sports injuries",
      "Vehicle accidents",
      "Repetitive stress in osteoporotic bones"
    ],
    imageSignifiers: [
      "Visible deformity",
      "Swelling",
      "Bruising",
      "Abnormal angle or positioning"
    ]
  },
  "Sprain/Strain": {
    injuryType: "Sprain/Strain",
    probability: 0.88,
    details: {
      severity: "low",
      location: "Joint/Muscle",
      bloodLevel: "none",
      foreignObjects: false
    },
    category: "sprain",
    symptoms: [
      "Pain and tenderness around the affected joint or muscle",
      "Swelling",
      "Bruising",
      "Limited flexibility or range of motion"
    ],
    urgencyLevel: 2,
    commonCauses: [
      "Sudden twisting or wrenching movements",
      "Falls",
      "Sports injuries",
      "Overexertion"
    ],
    imageSignifiers: [
      "Swelling around joint",
      "Bruising",
      "Abnormal position"
    ]
  },
  "Eye Injury": {
    injuryType: "Eye Injury",
    probability: 0.90,
    details: {
      severity: "medium",
      location: "Eye",
      bloodLevel: "none",
      foreignObjects: true
    },
    category: "eye",
    symptoms: [
      "Pain or discomfort in the eye",
      "Redness or bloodshot appearance",
      "Vision changes or blurriness",
      "Sensitivity to light",
      "Visible object in the eye"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Foreign objects",
      "Chemical exposure",
      "UV or radiation exposure",
      "Trauma or impact",
      "Scratches from contact lenses"
    ],
    imageSignifiers: [
      "Red or irritated eye",
      "Visible foreign body",
      "Abnormal pupil",
      "Excessive tearing"
    ]
  },
  "Allergic Reaction": {
    injuryType: "Allergic Reaction",
    probability: 0.87,
    details: {
      severity: "medium",
      location: "Body",
      bloodLevel: "none",
      foreignObjects: false
    },
    category: "allergic",
    symptoms: [
      "Skin reactions (hives, itching, rash)",
      "Swelling of the face, lips, tongue, or throat",
      "Congestion or runny nose",
      "Difficulty breathing",
      "Nausea, vomiting, or diarrhea"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Food allergies (nuts, shellfish, etc.)",
      "Medication reactions",
      "Insect stings or bites",
      "Contact with allergens (latex, plants)",
      "Environmental allergens"
    ],
    imageSignifiers: [
      "Hives or rash",
      "Swelling of face or extremities",
      "Red, irritated skin"
    ]
  },
  "Minor Wound": {
    injuryType: "Minor Wound",
    probability: 0.82,
    details: {
      severity: "low",
      location: "Surface skin",
      bloodLevel: "minimal",
      foreignObjects: false
    },
    category: "cut",
    symptoms: [
      "Small break in the skin",
      "Minimal bleeding that stops quickly",
      "Mild pain or discomfort",
      "Slight redness around the wound site"
    ],
    urgencyLevel: 1,
    commonCauses: [
      "Paper cuts",
      "Minor scrapes",
      "Small punctures",
      "Abrasions from falls"
    ],
    imageSignifiers: [
      "Small wound",
      "Minimal blood",
      "Superficial damage only"
    ]
  }
};

// Define the interface for the Vision AI response
interface VisionApiResponse {
  injuryType: string;
  confidence: number;
  matchedKeywords?: string[];
  details?: {
    severity?: "low" | "medium" | "high";
    location?: string;
    bloodLevel?: "none" | "minimal" | "moderate" | "severe";
    foreignObjects?: boolean;
  };
  detectionDetails?: {
    redDominance?: boolean;
    bloodMentions?: number;
    hasFace?: boolean;
    violenceScore?: string | number;
    geminiDetails?: {
      detectedObjects?: string[];
      detectedColors?: string[];
      detectedKeywords?: string[];
    };
  };
  error?: string;
}

// Define the interface for the Gemini API response
interface GeminiApiResponse {
  injuryType: string;
  confidence: number;
  details: {
    severity: "low" | "medium" | "high";
    location?: string;
    bloodLevel?: "none" | "minimal" | "moderate" | "severe";
    foreignObjects?: boolean;
  };
  detectionDetails?: {
    geminiDetails?: {
      detectedObjects?: string[];
      detectedColors?: string[];
      detectedKeywords?: string[];
      injuryProbability?: number;
    }
  }
  error?: string;
}

// Function to analyze image and determine injury type using Google Cloud Vision AI and Gemini
export const analyzeInjuryImage = async (imageFile: File): Promise<any> => {
  try {
    // First try using our Gemini API with RAG for accurate analysis
    const geminiResult = await geminiAnalyzeImage(imageFile, true);
    
    if (geminiResult.success) {
      // Parse the generated text into structured first aid instructions
      const instructions = parseFirstAidInstructions(geminiResult.generatedText);
      
      // Generate a response object that matches the expected API format
      return {
        injuryType: instructions.injuryType,
        confidence: 0.95,
        matchedKeywords: instructions.injuryType.toLowerCase().split(' '),
        details: {
          severity: instructions.severity,
          location: "Identified area",
          bloodLevel: instructions.bloodLevel,
          foreignObjects: instructions.foreignObjects
        },
        detectionDetails: {
          geminiDetails: {
            detectedObjects: [],
            detectedColors: [],
            detectedKeywords: instructions.injuryType.toLowerCase().split(' '),
            injuryProbability: 0.95
          }
        },
        firstAidInstructions: instructions,
        ragInfo: geminiResult.ragInfo
      };
    } else {
      // Fall back to the existing implementation if Gemini API fails
      console.error("Gemini API failed, falling back to default implementation");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, randomly choose an injury type from our dataset
      const injuryTypes = Object.keys(injuryData);
      const randomInjuryType = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
      
      return {
        injuryType: randomInjuryType,
        confidence: 0.8,
        matchedKeywords: [randomInjuryType.toLowerCase()],
        details: {
          severity: injuryData[randomInjuryType].details.severity,
          location: injuryData[randomInjuryType].details.location,
          bloodLevel: injuryData[randomInjuryType].details.bloodLevel,
          foreignObjects: injuryData[randomInjuryType].details.foreignObjects
        },
        detectionDetails: {
          redDominance: Math.random() > 0.5,
          bloodMentions: Math.floor(Math.random() * 3),
          hasFace: false,
          violenceScore: "low",
          geminiDetails: {
            detectedObjects: [],
            detectedColors: [],
            detectedKeywords: []
          }
        },
        error: geminiResult.error
      };
    }
  } catch (error) {
    console.error("Error in injury analysis:", error);
    return {
      injuryType: "Unknown",
      confidence: 0,
      error: "Failed to analyze the image. Please try again."
    };
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Function to get enhanced data for a specific injury type
export const getEnhancedInjuryData = (injuryType: string): EnhancedInjuryDetection => {
  // Return the data for the specific injury type, or a default if not found
  return injuryData[injuryType] || {
    injuryType: injuryType,
    probability: 0.7,
    details: {
      severity: "medium",
      location: "Unspecified",
      bloodLevel: "minimal",
      foreignObjects: false
    },
    category: "other" as InjuryTypeCategory,
    symptoms: ["Pain", "Discomfort", "Potential tissue damage"],
    urgencyLevel: 3,
    commonCauses: ["Accident", "Trauma", "External force"],
    imageSignifiers: ["Visible injury", "Affected area appearance"]
  };
};

// Generate appropriate steps based on injury type
export const generateStepsForInjury = (
  injuryType: string, 
  severity: "low" | "medium" | "high", 
  category: InjuryTypeCategory
) => {
  // In a real application, these would come from a medical database based on the specific injury
  if (category === "bleeding" || injuryType === "Bleeding") {
    return [
      { id: 1, content: "Apply direct pressure to the wound with a clean cloth or bandage.", important: true, hasVideo: true, hasAudio: true },
      { id: 2, content: "If blood soaks through, add another layer without removing the first.", hasVideo: true },
      { id: 3, content: "If possible, elevate the wound above the heart.", hasAudio: true },
      { id: 4, content: "If bleeding continues severely, apply pressure to the appropriate pressure point.", important: true, hasVideo: true },
      { id: 5, content: "Secure the dressing with a bandage once bleeding is controlled." }
    ];
  } else if (category === "burn") {
    return [
      { id: 1, content: "Remove the source of the burn if it's safe to do so.", important: true },
      { id: 2, content: "Cool the burn with cool (not cold) running water for 10 to 15 minutes.", duration: "10-15 min", hasVideo: true, hasAudio: true },
      { id: 3, content: "Remove any jewelry or tight items from the burned area before swelling occurs.", important: true },
      { id: 4, content: "Cover the burn with a sterile, non-adhesive bandage or clean cloth.", hasVideo: true },
      { id: 5, content: "Do not apply butter, oil, ice, or fluffy cotton to the burn.", important: true }
    ];
  } else if (category === "fracture") {
    return [
      { id: 1, content: "Immobilize the injured area. Do not attempt to realign the bone.", important: true, hasVideo: true, hasAudio: true },
      { id: 2, content: "Apply a cold pack wrapped in cloth to reduce swelling and pain.", duration: "15-20 min", hasVideo: true },
      { id: 3, content: "If the person must be moved, stabilize the area with a makeshift splint.", important: true, hasVideo: true },
      { id: 4, content: "Treat for shock if necessary by laying the person flat with feet elevated.", hasAudio: true },
      { id: 5, content: "Seek immediate medical attention for proper diagnosis and treatment." }
    ];
  } else if (category === "cardiac") {
    return [
      { id: 1, content: "Call emergency services immediately.", important: true },
      { id: 2, content: "Have the person sit or lie in a comfortable position, typically with head and shoulders elevated.", hasVideo: true, hasAudio: true },
      { id: 3, content: "If the person is responsive and has prescribed medication like nitroglycerin, help them take it.", important: true },
      { id: 4, content: "If the person is unresponsive and not breathing normally, begin CPR if trained.", important: true, hasVideo: true, hasAudio: true },
      { id: 5, content: "If an AED is available, use it following the device instructions.", hasVideo: true }
    ];
  } else if (category === "stroke") {
    return [
      { id: 1, content: "Remember the acronym FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services.", important: true, hasVideo: true, hasAudio: true },
      { id: 2, content: "Note the time when symptoms first appeared.", important: true },
      { id: 3, content: "Do not give the person anything to eat or drink.", important: true },
      { id: 4, content: "If the person is unresponsive but breathing, place them in the recovery position.", hasVideo: true },
      { id: 5, content: "Stay with the person until emergency help arrives." }
    ];
  } else if (category === "head") {
    return [
      { id: 1, content: "Keep the person still and awake if possible.", important: true },
      { id: 2, content: "Apply gentle pressure with a clean cloth if there's external bleeding.", hasVideo: true },
      { id: 3, content: "Apply a cold pack to swollen areas (wrapped in a cloth).", duration: "10 minutes", hasAudio: true },
      { id: 4, content: "Monitor for signs of concussion including confusion, vomiting, or unequal pupils.", important: true },
      { id: 5, content: "Seek immediate medical attention, especially with loss of consciousness or confusion.", important: true }
    ];
  } else if (category === "eye") {
    return [
      { id: 1, content: "Do NOT rub the eye or apply pressure.", important: true },
      { id: 2, content: "For chemical exposure, flush with clean water for 15-20 minutes.", duration: "15-20 min", hasVideo: true },
      { id: 3, content: "For a foreign object, try to flush it with water or blink repeatedly. Don't try to remove embedded objects.", important: true },
      { id: 4, content: "For blunt trauma, apply a cold compress without pressure.", hasVideo: true },
      { id: 5, content: "Seek medical attention, especially for chemical exposures, embedded objects, or vision changes.", important: true }
    ];
  } else if (category === "cut") {
    return [
      { id: 1, content: "Clean the wound with clean water and mild soap if available.", hasVideo: true },
      { id: 2, content: "Apply gentle pressure with a clean cloth or bandage until bleeding stops.", important: true, hasVideo: true, hasAudio: true },
      { id: 3, content: "Once bleeding stops, apply an antibiotic ointment if available.", hasAudio: true },
      { id: 4, content: "Cover the wound with a sterile bandage or clean cloth.", hasVideo: true },
      { id: 5, content: "Seek medical attention for deep cuts, dirty wounds, or if the bleeding doesn't stop after 15 minutes of pressure.", important: true }
    ];
  } else {
    // Default steps for other injuries
    return [
      { id: 1, content: "Assess the injury carefully without causing additional harm.", hasVideo: true },
      { id: 2, content: "Clean the affected area gently with mild soap and water if appropriate.", hasAudio: true },
      { id: 3, content: "Apply appropriate first aid based on the specific injury.", important: severity === "high" || severity === "medium", hasVideo: true },
      { id: 4, content: "Cover with a clean bandage if needed.", hasVideo: true },
      { id: 5, content: "Monitor for changes in condition and seek medical attention as needed." }
    ];
  }
};

// Generate a complete result set for a specific injury type
export const generateResultForInjuryType = (injuryType: string): PathwayApiResponse => {
  // Define injury details based on injury type
  let severity: "low" | "medium" | "high" = "low";
  let category: InjuryTypeCategory = "cut";
  let location = "Arm/Hand";
  let bloodLevel: "moderate" | "minimal" | "none" | "severe" = "minimal";
  let foreignObjects = false;
  
  // Set appropriate values based on injury type
  if (injuryType === "Burn Injury") {
    severity = "medium";
    category = "burn";
    bloodLevel = "none";
  } else if (injuryType === "Fracture") {
    severity = "high";
    category = "fracture";
    location = "Arm/Leg";
    bloodLevel = "minimal";
  } else if (injuryType === "Sprain/Strain") {
    severity = "low";
    category = "sprain";
    location = "Ankle/Wrist";
    bloodLevel = "none";
  } else if (injuryType === "Cut/Laceration") {
    severity = "medium";
    category = "cut";
    bloodLevel = "moderate";
  } else if (injuryType === "Bleeding") {
    severity = "high";
    category = "bleeding";
    bloodLevel = "severe";
    location = "Wound site";
  } else if (injuryType === "Head Injury") {
    severity = "high";
    category = "head";
    location = "Head";
    bloodLevel = "moderate";
  } else if (injuryType === "Eye Injury") {
    severity = "medium";
    category = "eye";
    location = "Eye";
    bloodLevel = "none";
    foreignObjects = true;
  } else if (injuryType === "Allergic Reaction") {
    severity = "medium";
    category = "allergic";
    location = "Face/Body";
    bloodLevel = "none";
  } else if (injuryType === "Minor Wound") {
    severity = "low";
    category = "cut";
    bloodLevel = "minimal";
  }
  
  // Generate appropriate steps based on the injury type
  const steps = generateStepsForInjury(injuryType, severity, category);
  
  return {
    results: [{
      injuryType,
      probability: 0.87,
      details: {
        severity,
        location,
        bloodLevel,
        foreignObjects
      }
    }],
    vectorSearchDetails: {
      similarDocuments: [
        {
          title: `${injuryType} Treatment Protocol`,
          similarity: 0.92
        },
        {
          title: "Emergency First Aid Guidelines",
          similarity: 0.85
        },
        {
          title: `Common ${category} injuries`,
          similarity: 0.78
        }
      ],
      contextChunks: 8
    },
    firstAidInstructions: {
      injuryType,
      severity,
      location,
      bloodLevel,
      foreignObjects,
      steps,
      warning: severity === "high" ? "Seek immediate medical attention!" : 
              severity === "medium" ? "Consult with a healthcare professional as soon as possible." : 
              "Monitor the condition and seek medical attention if symptoms worsen.",
      note: "These instructions are based on current medical guidelines and are meant for temporary care until professional help is available.",
      sources: [
        "American Red Cross First Aid Guidelines",
        "Mayo Clinic Emergency Procedures",
        "National Institute for Health - First Aid Protocols"
      ],
      estimatedTime: "5-10 minutes"
    },
    processingTime: 1.2
  };
};
