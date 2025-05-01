
import { 
  FirstAidInstructionsProps, 
  PathwayApiResponse, 
  InjuryDetectionResult,
  EnhancedInjuryDetection,
  InjuryTypeCategory 
} from "@/types/firstAid";

// Simulated injury detection database with different attributes for different injury types
const injuryDatabase: Record<string, EnhancedInjuryDetection> = {
  "burn": {
    injuryType: "Thermal Burn",
    probability: 0.94,
    category: "burn",
    details: {
      severity: "medium",
      location: "Hand/Arm",
      bloodLevel: "none",
    },
    symptoms: [
      "Redness and inflammation",
      "Pain or tenderness",
      "Blisters",
      "Peeling skin",
      "Whitening of the affected area"
    ],
    urgencyLevel: 3,
    commonCauses: [
      "Contact with hot objects",
      "Exposure to fire",
      "Scalding liquids",
      "Chemical exposure",
      "Electrical burns"
    ],
    imageSignifiers: [
      "Visible redness and inflammation",
      "Blistering of the skin",
      "Clear burn pattern corresponding to heat source"
    ]
  },
  "cut": {
    injuryType: "Laceration",
    probability: 0.92,
    category: "cut",
    details: {
      severity: "medium",
      location: "Finger/Hand",
      bloodLevel: "moderate",
    },
    symptoms: [
      "Bleeding",
      "Pain",
      "Swelling",
      "Wound edges separated",
      "Possible tissue exposure"
    ],
    urgencyLevel: 3,
    commonCauses: [
      "Sharp objects",
      "Kitchen accidents",
      "Glass breakage",
      "Tool misuse",
      "Falls onto sharp edges"
    ],
    imageSignifiers: [
      "Linear wound pattern",
      "Clean or jagged edges",
      "Visible blood",
      "Depth of wound"
    ]
  },
  "fracture": {
    injuryType: "Bone Fracture",
    probability: 0.89,
    category: "fracture",
    details: {
      severity: "high",
      location: "Arm/Leg",
    },
    symptoms: [
      "Severe pain",
      "Swelling",
      "Bruising",
      "Deformity",
      "Limited mobility",
      "Inability to bear weight"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Falls",
      "Sports injuries",
      "Direct impacts",
      "Vehicular accidents",
      "Repetitive stress"
    ],
    imageSignifiers: [
      "Visible deformity",
      "Abnormal angle of limb",
      "Significant swelling and bruising",
      "Unable to use affected limb"
    ]
  },
  "sprain": {
    injuryType: "Ankle Sprain",
    probability: 0.88,
    category: "sprain",
    details: {
      severity: "medium",
      location: "Ankle/Joint",
    },
    symptoms: [
      "Pain with movement",
      "Swelling",
      "Bruising",
      "Limited range of motion",
      "Instability in the joint"
    ],
    urgencyLevel: 2,
    commonCauses: [
      "Awkward landings",
      "Twisted joints",
      "Sports activities",
      "Walking on uneven surfaces",
      "Falls"
    ],
    imageSignifiers: [
      "Swelling around the joint",
      "Bruising or discoloration",
      "No visible deformity (unlike fractures)"
    ]
  },
  "cardiac": {
    injuryType: "Potential Cardiac Event",
    probability: 0.87,
    category: "cardiac",
    details: {
      severity: "high",
      location: "Chest",
    },
    symptoms: [
      "Chest pain or pressure",
      "Pain radiating to arm, neck, or jaw",
      "Shortness of breath",
      "Nausea",
      "Cold sweat",
      "Lightheadedness"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Heart attack",
      "Angina",
      "Heart rhythm disorders",
      "Inflammation (pericarditis)",
      "Heart valve problems"
    ],
    imageSignifiers: [
      "Person clutching chest",
      "Facial distress",
      "Unusual positioning (hunched over)",
      "Apparent difficulty breathing"
    ]
  },
  "stroke": {
    injuryType: "Possible Stroke",
    probability: 0.85,
    category: "stroke",
    details: {
      severity: "high",
    },
    symptoms: [
      "Facial drooping on one side",
      "Arm weakness",
      "Slurred speech",
      "Confusion",
      "Trouble walking",
      "Severe headache"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Blood clot blocking blood flow to brain",
      "Ruptured blood vessel in brain",
      "Temporary decrease in blood flow to brain (TIA)"
    ],
    imageSignifiers: [
      "Facial asymmetry",
      "One-sided weakness or paralysis",
      "Confused expression",
      "Difficulty maintaining posture"
    ]
  },
  "choking": {
    injuryType: "Choking Hazard",
    probability: 0.91,
    category: "choking",
    details: {
      severity: "high",
      foreignObjects: true
    },
    symptoms: [
      "Inability to speak or breathe",
      "Clutching the throat",
      "Wheezing or coughing",
      "Blue-tinged skin",
      "Panic or distress"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Food obstruction",
      "Small objects",
      "Aspirated fluid",
      "Swelling from allergic reaction"
    ],
    imageSignifiers: [
      "Universal choking sign (hands at throat)",
      "Visible distress",
      "Signs of respiratory difficulty",
      "Unusual neck/throat positioning"
    ]
  },
  "bleeding": {
    injuryType: "Severe Bleeding",
    probability: 0.96,
    category: "bleeding",
    details: {
      severity: "high",
      bloodLevel: "severe"
    },
    symptoms: [
      "Continuous blood flow",
      "Spurting blood (arterial bleeding)",
      "Blood soaked clothing/bandages",
      "Dizziness or weakness",
      "Pale, clammy skin"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Deep lacerations",
      "Penetrating wounds",
      "Traumatic injuries",
      "Arterial damage",
      "Post-surgical complications"
    ],
    imageSignifiers: [
      "Visible blood flow",
      "Saturated bandages/clothing",
      "Blood pooling",
      "Wound depth with active bleeding"
    ]
  },
  "allergic": {
    injuryType: "Allergic Reaction",
    probability: 0.90,
    category: "allergic",
    details: {
      severity: "medium",
    },
    symptoms: [
      "Skin rash or hives",
      "Itching",
      "Swelling of face, lips, or throat",
      "Difficulty breathing",
      "Nausea or vomiting",
      "Dizziness"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Food allergies",
      "Medication reactions",
      "Insect stings/bites",
      "Environmental allergens",
      "Chemical exposure"
    ],
    imageSignifiers: [
      "Visible rash or hives",
      "Facial swelling",
      "Redness of affected areas",
      "Respiratory distress indicators"
    ]
  },
  "head": {
    injuryType: "Head Injury",
    probability: 0.88,
    category: "head",
    details: {
      severity: "high",
      location: "Head",
      bloodLevel: "minimal"
    },
    symptoms: [
      "Pain or tenderness",
      "Swelling or bruising",
      "Disorientation or confusion",
      "Headache",
      "Nausea or vomiting",
      "Balance problems"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Falls",
      "Sports injuries",
      "Vehicular accidents",
      "Direct impact to head",
      "Assault"
    ],
    imageSignifiers: [
      "Visible swelling or bruising",
      "Disorientation in facial expression",
      "Wound or impact site visible",
      "Person holding or protecting head"
    ]
  },
  "eye": {
    injuryType: "Eye Injury",
    probability: 0.93,
    category: "eye",
    details: {
      severity: "high",
      location: "Eye",
      foreignObjects: true
    },
    symptoms: [
      "Pain or discomfort in eye",
      "Redness",
      "Tearing or discharge",
      "Sensitivity to light",
      "Vision changes",
      "Visible foreign body"
    ],
    urgencyLevel: 4,
    commonCauses: [
      "Foreign objects",
      "Chemical splashes",
      "Blunt trauma",
      "Scratches or abrasions",
      "Burns"
    ],
    imageSignifiers: [
      "Redness in or around eye",
      "Visible foreign object",
      "Squinting or eye closure",
      "Tear production",
      "Abnormal eye appearance"
    ]
  },
  "poisoning": {
    injuryType: "Potential Poisoning",
    probability: 0.85,
    category: "poisoning",
    details: {
      severity: "high",
    },
    symptoms: [
      "Nausea or vomiting",
      "Abdominal pain",
      "Difficulty breathing",
      "Confusion or altered mental state",
      "Burns around mouth",
      "Unusual odors on breath"
    ],
    urgencyLevel: 5,
    commonCauses: [
      "Ingestion of household chemicals",
      "Medication overdose",
      "Carbon monoxide exposure",
      "Food poisoning",
      "Plant or mushroom ingestion"
    ],
    imageSignifiers: [
      "Signs of nausea/vomiting",
      "Unusual posture (clutching stomach)",
      "Visible container of potential toxin",
      "Confusion or distress"
    ]
  }
};

// First aid instructions templates for different injury types
const firstAidInstructionsTemplates: Record<InjuryTypeCategory, FirstAidInstructionsProps> = {
  "burn": {
    injuryType: "Thermal Burn",
    severity: "medium",
    location: "Hand/Arm",
    steps: [
      { id: 1, content: "Remove from heat source immediately.", important: true },
      { id: 2, content: "Remove clothing or jewelry near the burned area.", duration: "30-60 seconds" },
      { id: 3, content: "Cool the burn with cool (not cold) running water for 10-15 minutes.", important: true, duration: "10-15 minutes", hasVideo: true },
      { id: 4, content: "Do not apply ice directly to the burn as it can damage the tissue further." },
      { id: 5, content: "Cover the burn with a sterile, non-adhesive bandage or clean cloth.", hasVideo: true },
      { id: 6, content: "Take over-the-counter pain reliever if needed for pain management." }
    ],
    warning: "Seek immediate medical attention for severe burns, burns covering large areas, or burns on the face, hands, feet, genitals, or major joints.",
    note: "Do not apply butter, oil, or ointments to burns as these can trap heat and increase damage.",
    sources: ["American Burn Association", "Mayo Clinic", "World Health Organization"],
    estimatedTime: "Initial care: 20-30 minutes"
  },
  "cut": {
    injuryType: "Laceration",
    severity: "medium",
    location: "Finger/Hand",
    bloodLevel: "moderate",
    steps: [
      { id: 1, content: "Apply direct pressure to the wound with a clean cloth or bandage to stop bleeding.", important: true, duration: "5-10 minutes", hasVideo: true },
      { id: 2, content: "Clean the wound gently with clean water. Mild soap can be used around the wound.", hasVideo: true },
      { id: 3, content: "Remove any visible debris if easily accessible. Do not probe deeply into the wound." },
      { id: 4, content: "Apply antibiotic ointment if available." },
      { id: 5, content: "Cover with a sterile bandage or adhesive bandage.", hasVideo: true },
      { id: 6, content: "Elevate the injured area if possible to reduce swelling." }
    ],
    warning: "Seek medical attention if bleeding doesn't stop after 10-15 minutes of pressure, if the wound is deep or gaping, contains debris you cannot remove, or shows signs of infection.",
    note: "Keep the wound clean and change bandages regularly. Watch for signs of infection such as increased pain, redness, swelling, or discharge.",
    sources: ["American Red Cross", "Mayo Clinic", "CDC"],
    estimatedTime: "Initial care: 15-20 minutes"
  },
  "fracture": {
    injuryType: "Bone Fracture",
    severity: "high",
    location: "Arm/Leg",
    steps: [
      { id: 1, content: "Keep the injured area immobile - do not try to straighten a deformed limb.", important: true, hasVideo: true },
      { id: 2, content: "Apply ice wrapped in a cloth to reduce swelling and pain.", duration: "15-20 minutes" },
      { id: 3, content: "If possible, immobilize the area using a splint and padding.", hasVideo: true, hasAudio: true },
      { id: 4, content: "Elevate the injured area if possible to reduce swelling." },
      { id: 5, content: "Cover any open wounds with clean bandages." },
      { id: 6, content: "Monitor for signs of shock such as paleness, rapid breathing, or weakness." }
    ],
    warning: "A suspected fracture requires immediate medical attention. Do not attempt to move someone with a suspected spine, neck, or pelvis fracture unless they are in immediate danger.",
    note: "Even small movements can cause significant damage with fractures. Wait for emergency services whenever possible.",
    sources: ["American Academy of Orthopaedic Surgeons", "Mayo Clinic"],
    estimatedTime: "Immobilization: 10-15 minutes; Medical attention required"
  },
  "sprain": {
    injuryType: "Ankle Sprain",
    severity: "medium",
    location: "Ankle/Joint",
    steps: [
      { id: 1, content: "Rest - stop using the injured area and avoid putting weight on it.", important: true },
      { id: 2, content: "Ice - apply ice wrapped in a thin cloth for 15-20 minutes every 2-3 hours.", duration: "15-20 minutes", hasVideo: true },
      { id: 3, content: "Compression - use an elastic bandage to provide support and reduce swelling.", hasVideo: true },
      { id: 4, content: "Elevation - keep the injured area elevated above heart level when possible." },
      { id: 5, content: "Take over-the-counter pain medication if needed for pain management." }
    ],
    warning: "Seek medical attention if you cannot bear weight on the injured joint, if there is significant swelling or bruising, or if pain and swelling don't improve after 24-48 hours.",
    note: "Remember the acronym RICE: Rest, Ice, Compression, Elevation.",
    sources: ["American Academy of Orthopaedic Surgeons", "Mayo Clinic"],
    estimatedTime: "Initial care: 30-40 minutes; Ongoing care for 24-72 hours"
  },
  "cardiac": {
    injuryType: "Potential Cardiac Event",
    severity: "high",
    location: "Chest",
    steps: [
      { id: 1, content: "Call emergency services (108) immediately.", important: true, hasAudio: true },
      { id: 2, content: "Help the person into a comfortable position, typically sitting upright.", hasVideo: true },
      { id: 3, content: "Loosen any tight clothing." },
      { id: 4, content: "If the person has prescribed nitroglycerin or other heart medication, help them take it." },
      { id: 5, content: "If the person is unresponsive and not breathing or only gasping, begin CPR if trained.", important: true, hasVideo: true, hasAudio: true },
      { id: 6, content: "If an automated external defibrillator (AED) is available, use it following the device instructions.", hasVideo: true }
    ],
    warning: "Any suspected heart attack or cardiac event is a medical emergency requiring immediate professional care. Every minute counts.",
    note: "Even if symptoms subside, still seek emergency medical attention as cardiac events may fluctuate in intensity.",
    sources: ["American Heart Association", "Mayo Clinic", "CDC"],
    estimatedTime: "Emergency response required immediately"
  },
  "stroke": {
    injuryType: "Possible Stroke",
    severity: "high",
    steps: [
      { id: 1, content: "Call emergency services (108) immediately - note the time symptoms first appeared.", important: true, hasAudio: true },
      { id: 2, content: "Perform the FAST test: Face (ask them to smile - look for drooping), Arms (ask them to raise both arms - look for drifting), Speech (ask them to repeat a simple phrase - listen for slurring), Time (note when symptoms started).", important: true, hasVideo: true },
      { id: 3, content: "Help the person lie down on their side with head slightly elevated if they are conscious." },
      { id: 4, content: "Do not give them medication, food, or drinks." },
      { id: 5, content: "Monitor breathing and consciousness. Be prepared to perform CPR if they become unresponsive and are not breathing normally.", hasVideo: true },
      { id: 6, content: "Reassure the person while waiting for emergency services." }
    ],
    warning: "Stroke is a medical emergency. Fast treatment is crucial to minimize brain damage and potential complications.",
    note: "Remember 'Time is Brain' - the sooner a stroke victim receives medical attention, the better the chances of recovery.",
    sources: ["American Stroke Association", "Mayo Clinic", "NIH"],
    estimatedTime: "Emergency response required immediately"
  },
  "choking": {
    injuryType: "Choking Hazard",
    severity: "high",
    foreignObjects: true,
    steps: [
      { id: 1, content: "Determine if the person can speak, cough, or breathe. If they can, encourage them to continue coughing.", important: true },
      { id: 2, content: "If the person cannot speak, cough, or breathe, stand behind them and wrap your arms around their waist.", hasVideo: true, hasAudio: true },
      { id: 3, content: "Make a fist with one hand and place it just above the person's navel (belly button).", hasVideo: true },
      { id: 4, content: "Grab your fist with your other hand and press hard into the abdomen with a quick, upward thrust.", important: true, hasVideo: true },
      { id: 5, content: "Repeat thrusts until the object is expelled or the person becomes unconscious." },
      { id: 6, content: "If the person becomes unconscious, carefully lower them to the ground, call 108, and begin CPR if trained.", hasVideo: true }
    ],
    warning: "For pregnant women or obese individuals, perform chest thrusts instead of abdominal thrusts. For infants under 1 year, use back blows and chest thrusts.",
    note: "After successful removal of the obstruction, the person should be evaluated by a healthcare professional, as complications can occur.",
    sources: ["American Red Cross", "Mayo Clinic", "American Heart Association"],
    estimatedTime: "Emergency response required immediately"
  },
  "bleeding": {
    injuryType: "Severe Bleeding",
    severity: "high",
    bloodLevel: "severe",
    steps: [
      { id: 1, content: "Call emergency services (108) immediately.", important: true, hasAudio: true },
      { id: 2, content: "Apply firm, direct pressure to the wound using a clean cloth, bandage, or clothing.", important: true, hasVideo: true },
      { id: 3, content: "If possible, elevate the injured area above the heart.", hasVideo: true },
      { id: 4, content: "Apply pressure continuously for at least 15 minutes. Do not remove the cloth if it becomes soaked with blood - add more material on top.", duration: "15+ minutes" },
      { id: 5, content: "If bleeding continues severely and you have access to a commercial tourniquet, apply it according to instructions or training.", hasVideo: true },
      { id: 6, content: "Keep the person warm and monitor for signs of shock (pale skin, rapid breathing, weakness)." }
    ],
    warning: "Only use a tourniquet as a last resort when direct pressure fails to control life-threatening bleeding, and only if you have proper training or clear instructions.",
    note: "Always seek emergency medical care for severe bleeding, even if you manage to stop the bleeding initially.",
    sources: ["American College of Surgeons", "American Red Cross", "Mayo Clinic"],
    estimatedTime: "Emergency response required immediately"
  },
  "allergic": {
    injuryType: "Allergic Reaction",
    severity: "medium",
    steps: [
      { id: 1, content: "Identify and remove the allergen if possible.", important: true },
      { id: 2, content: "For severe reactions (difficulty breathing, swelling of face/throat, dizziness): Use an epinephrine auto-injector (EpiPen) if available and call 108 immediately.", important: true, hasVideo: true, hasAudio: true },
      { id: 3, content: "For mild to moderate skin reactions: Apply a cold compress to reduce swelling and itching.", hasVideo: true },
      { id: 4, content: "If the person is conscious and able to swallow, an antihistamine like diphenhydramine (Benadryl) can help with symptoms." },
      { id: 5, content: "Help the person remain calm and monitor their symptoms closely." },
      { id: 6, content: "If symptoms worsen, especially breathing difficulties, call emergency services immediately." }
    ],
    warning: "Severe allergic reactions (anaphylaxis) can be life-threatening. Do not wait to see if symptoms improve - use epinephrine and seek emergency care immediately.",
    note: "Even if symptoms improve after epinephrine, the person still needs medical evaluation as symptoms can return.",
    sources: ["American Academy of Allergy, Asthma & Immunology", "Mayo Clinic", "CDC"],
    estimatedTime: "For severe reactions: Emergency response required immediately"
  },
  "head": {
    injuryType: "Head Injury",
    severity: "high",
    location: "Head",
    bloodLevel: "minimal",
    steps: [
      { id: 1, content: "Call emergency services (108) for moderate to severe head injuries.", important: true, hasAudio: true },
      { id: 2, content: "Keep the person still and stabilize their head and neck if you suspect a spinal injury.", important: true, hasVideo: true },
      { id: 3, content: "If the person is bleeding, apply gentle pressure with a clean cloth, being careful not to press on a skull fracture if one is suspected.", hasVideo: true },
      { id: 4, content: "Monitor for changes in consciousness, breathing, or behavior." },
      { id: 5, content: "If the person is vomiting and lying down, carefully turn their head to the side to prevent choking while supporting their neck.", hasVideo: true },
      { id: 6, content: "Do not remove any objects impaled in the head and do not shake the person if they appear dazed." }
    ],
    warning: "Always seek immediate medical attention for head injuries with symptoms such as loss of consciousness, severe headache, vomiting, seizures, unequal pupils, clear fluid from ears or nose, or changes in behavior.",
    note: "Symptoms of serious head injury may not appear immediately and can develop hours or days later.",
    sources: ["Brain Injury Association of America", "Mayo Clinic", "CDC"],
    estimatedTime: "Emergency response required for moderate to severe injuries"
  },
  "eye": {
    injuryType: "Eye Injury",
    severity: "high",
    location: "Eye",
    foreignObjects: true,
    steps: [
      { id: 1, content: "DO NOT rub the eye or apply pressure.", important: true, hasAudio: true },
      { id: 2, content: "For a small foreign object: Gently flush the eye with clean water or saline solution.", hasVideo: true },
      { id: 3, content: "For chemicals in the eye: Flush continuously with clean water for 15-20 minutes.", important: true, duration: "15-20 minutes", hasVideo: true },
      { id: 4, content: "For a struck eye: Apply a cold compress without pressure to reduce swelling.", hasVideo: true },
      { id: 5, content: "For an embedded object: DO NOT attempt to remove it. Stabilize it and cover the eye with a cup or shield without applying pressure.", important: true, hasVideo: true },
      { id: 6, content: "Cover both eyes with loose bandages, as moving one eye moves the other." }
    ],
    warning: "All significant eye injuries require immediate medical attention. Never attempt to remove deeply embedded objects from the eye.",
    note: "Do not use eye drops, ointments, or medications before seeking medical care unless specifically directed by a healthcare professional.",
    sources: ["American Academy of Ophthalmology", "Mayo Clinic"],
    estimatedTime: "For chemical exposure: 15-20 minutes of irrigation; Medical attention required"
  },
  "poisoning": {
    injuryType: "Potential Poisoning",
    severity: "high",
    steps: [
      { id: 1, content: "Call the Poison Control Center (1-800-222-1222) or emergency services (108) immediately.", important: true, hasAudio: true },
      { id: 2, content: "Do not induce vomiting or give anything to drink unless specifically instructed by a medical professional.", important: true },
      { id: 3, content: "If possible, identify the poison and how much was ingested/exposed to report to emergency services." },
      { id: 4, content: "For poisonous substances on the skin: Remove contaminated clothing and rinse skin with running water for 15-20 minutes.", duration: "15-20 minutes", hasVideo: true },
      { id: 5, content: "For inhaled poisons: Get the person to fresh air immediately.", hasVideo: true },
      { id: 6, content: "Save the container or any remaining substance for identification, but do not expose yourself to the substance." }
    ],
    warning: "Different poisons require different treatments. Never follow general remedies (like milk or inducing vomiting) without specific medical direction.",
    note: "Most poisonings are treatable with prompt care. Call for help even if you're unsure about the severity.",
    sources: ["American Association of Poison Control Centers", "Mayo Clinic", "CDC"],
    estimatedTime: "Emergency response required immediately"
  },
  "other": {
    injuryType: "Unidentified Injury",
    severity: "medium",
    steps: [
      { id: 1, content: "Assess the situation to ensure your safety and the safety of the injured person.", important: true },
      { id: 2, content: "Check responsiveness: Tap the person and ask if they're okay.", hasVideo: true },
      { id: 3, content: "If responsive: Keep the person still and comfortable while assessing their condition." },
      { id: 4, content: "Look for obvious injuries: bleeding, swelling, deformities, etc.", hasVideo: true },
      { id: 5, content: "Monitor breathing and consciousness. Call emergency services if there are any serious concerns." },
      { id: 6, content: "Keep the person warm and reassured while waiting for help." }
    ],
    warning: "When in doubt about an injury's severity, always contact emergency services for guidance.",
    note: "Basic first aid principles apply to many injuries: ensure safety, maintain airway and breathing, control bleeding, and prevent shock.",
    sources: ["American Red Cross", "Mayo Clinic", "CDC"],
    estimatedTime: "Assessment: 3-5 minutes; Further care depends on injury type"
  }
};

// Function to simulate image recognition with different injury types
export function simulatePathwayImageRecognition(imageFile: File): Promise<PathwayApiResponse> {
  return new Promise((resolve) => {
    // Analyze the image name to determine what type of injury to "detect"
    // This is a simple simulation - in a real app, this would be done by AI analysis
    const fileName = imageFile.name.toLowerCase();
    
    let detectedInjuryType: InjuryTypeCategory = "other";
    
    // Simple keyword matching to simulate different injury detections
    if (fileName.includes("burn") || fileName.includes("fire") || fileName.includes("heat")) {
      detectedInjuryType = "burn";
    } else if (fileName.includes("cut") || fileName.includes("laceration") || fileName.includes("knife")) {
      detectedInjuryType = "cut";
    } else if (fileName.includes("fracture") || fileName.includes("broken") || fileName.includes("bone")) {
      detectedInjuryType = "fracture";
    } else if (fileName.includes("sprain") || fileName.includes("twist") || fileName.includes("ankle")) {
      detectedInjuryType = "sprain";
    } else if (fileName.includes("heart") || fileName.includes("chest") || fileName.includes("cardiac")) {
      detectedInjuryType = "cardiac";
    } else if (fileName.includes("stroke") || fileName.includes("face") || fileName.includes("droop")) {
      detectedInjuryType = "stroke";
    } else if (fileName.includes("choke") || fileName.includes("throat") || fileName.includes("airway")) {
      detectedInjuryType = "choking";
    } else if (fileName.includes("blood") || fileName.includes("bleeding") || fileName.includes("wound")) {
      detectedInjuryType = "bleeding";
    } else if (fileName.includes("allergy") || fileName.includes("rash") || fileName.includes("hive")) {
      detectedInjuryType = "allergic";
    } else if (fileName.includes("head") || fileName.includes("concussion") || fileName.includes("skull")) {
      detectedInjuryType = "head";
    } else if (fileName.includes("eye") || fileName.includes("vision") || fileName.includes("sight")) {
      detectedInjuryType = "eye";
    } else if (fileName.includes("poison") || fileName.includes("toxic") || fileName.includes("chemical")) {
      detectedInjuryType = "poisoning";
    } else {
      // Random injury type if no matching keywords
      const injuryTypes: InjuryTypeCategory[] = [
        "burn", "cut", "fracture", "sprain", "cardiac", "stroke", 
        "choking", "bleeding", "allergic", "head", "eye", "poisoning"
      ];
      detectedInjuryType = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
    }
    
    // Get the corresponding injury data and first aid instructions
    const detectedInjury = injuryDatabase[detectedInjuryType];
    const instructions = firstAidInstructionsTemplates[detectedInjuryType];
    
    // Create a simulated Pathway API response
    const apiResponse: PathwayApiResponse = {
      results: [
        {
          injuryType: detectedInjury.injuryType,
          probability: detectedInjury.probability,
          details: {
            ...detectedInjury.details
          }
        }
      ],
      vectorSearchDetails: {
        similarDocuments: [
          { title: "First Aid for " + detectedInjury.injuryType, similarity: 0.92 },
          { title: "Medical Guidelines for " + detectedInjury.category + " injuries", similarity: 0.87 },
          { title: "Emergency Response Handbook", similarity: 0.81 }
        ],
        contextChunks: 5
      },
      firstAidInstructions: instructions,
      processingTime: Math.random() * 1000 + 500 // Random processing time from 500-1500ms
    };
    
    // Simulate network delay
    setTimeout(() => {
      resolve(apiResponse);
    }, 1500);
  });
}

// Function to get enhanced injury detection data
export function getEnhancedInjuryData(injuryType: string): EnhancedInjuryDetection {
  // Find the matching injury in our database or return a default
  const categoryKeys = Object.keys(injuryDatabase) as InjuryTypeCategory[];
  
  // Look for exact match
  for (const category of categoryKeys) {
    if (injuryDatabase[category].injuryType.toLowerCase() === injuryType.toLowerCase()) {
      return injuryDatabase[category];
    }
  }
  
  // Look for partial match
  for (const category of categoryKeys) {
    if (injuryDatabase[category].injuryType.toLowerCase().includes(injuryType.toLowerCase()) ||
        injuryType.toLowerCase().includes(category)) {
      return injuryDatabase[category];
    }
  }
  
  // Default to "other" if no match
  return {
    injuryType: injuryType,
    probability: 0.7,
    category: "other",
    details: {
      severity: "medium"
    },
    symptoms: [
      "Pain or discomfort",
      "Swelling",
      "Limited mobility",
      "Visible signs of injury"
    ],
    urgencyLevel: 3,
    commonCauses: [
      "Various accidents",
      "Falls",
      "Impacts",
      "Trauma"
    ],
    imageSignifiers: [
      "Signs of discomfort",
      "Visible abnormalities",
      "Protected posture"
    ]
  };
}
