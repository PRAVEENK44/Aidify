// First Aid Knowledge Base
// This file contains structured information about various first aid scenarios
// that will be used for the RAG (Retrieval-Augmented Generation) system

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  symptoms: string[];
  content: string;
  emergency_signs: string[];
  visual_indicators?: string[]; // Added to help with visual identification
}

export const firstAidKnowledgeBase: KnowledgeBaseEntry[] = [
  {
    "id": "cuts_scrapes",
    "title": "Cuts and Scrapes",
    "symptoms": ["bleeding", "pain", "redness", "swelling"],
    "content": "Minor cuts and scrapes usually stop bleeding on their own. If they don't, apply gentle pressure with a clean bandage or cloth and elevate the wound until bleeding stops. Rinse the wound with clean water. Avoid using soap on the wound itself as it can irritate the injury. Apply an antibiotic ointment to prevent infection. Cover the wound with a sterile bandage. Change the dressing at least once a day or whenever it gets wet or dirty. Watch for signs of infection, including redness, increasing pain, drainage, warmth, or swelling.",
    "emergency_signs": ["deep cuts where fat, muscle or bone may be visible", "wounds with jagged edges", "wounds with embedded objects", "wounds that won't stop bleeding after 10 minutes of pressure", "wounds from rusty objects", "animal or human bites"],
    "visual_indicators": ["visible open wound", "blood on skin surface", "linear or irregular break in skin", "reddened skin around wound edge"]
  },
  {
    "id": "burns",
    "title": "Burns",
    "symptoms": ["redness", "pain", "swelling", "blisters", "peeling skin"],
    "content": "For minor burns (first-degree), cool the burn with cool (not cold) running water for 10 to 15 minutes or until the pain eases. Don't use ice as it can damage the skin. Apply aloe vera gel or moisturizer to prevent drying. Take an over-the-counter pain reliever if needed. Don't break blisters as they protect against infection. Cover the burn with a sterile, non-stick bandage. For second-degree burns smaller than 3 inches in diameter, follow the same procedures as for minor burns. Seek medical attention for larger second-degree burns and all third-degree burns.",
    "emergency_signs": ["burns larger than 3 inches in diameter", "burns on the face, hands, feet, genitals or over a joint", "third-degree burns (white or charred appearance)", "burns from chemicals, electricity, or explosions"],
    "visual_indicators": ["reddened, discolored skin", "blisters or broken skin", "charred or white tissue", "peeling skin layers"]
  },
  {
    "id": "sprains_strains",
    "title": "Sprains and Strains",
    "symptoms": ["pain", "swelling", "bruising", "limited mobility", "hearing a pop at time of injury"],
    "content": "Follow the RICE method: Rest the injured area, Ice the area for 20 minutes 4-8 times a day, Compress with an elastic bandage, and Elevate the injured area above heart level if possible. Take over-the-counter pain medications like ibuprofen or acetaminophen to reduce pain and inflammation. Avoid activities that cause pain for the first 24-48 hours. For mild sprains and strains, gentle movement of the injured area may promote healing after 2 days.",
    "emergency_signs": ["inability to bear weight on an injured leg", "inability to move the injured joint", "numbness in any part of the injured area", "severe pain and swelling", "visible deformity"],
    "visual_indicators": ["swelling around joint", "bruising or discoloration", "abnormal position of joint", "limited range of motion when attempting movement"]
  },
  {
    "id": "knee_injuries",
    "title": "Knee Injuries",
    "symptoms": ["pain", "swelling", "stiffness", "popping or crunching noises", "inability to fully straighten the knee", "feeling of instability", "warmth and redness"],
    "content": "For minor knee injuries, follow the RICE protocol: Rest the knee by avoiding weight-bearing activities, apply Ice for 20 minutes every 2-3 hours, Compress with an elastic bandage to reduce swelling (not too tight), and Elevate the knee when resting. Take over-the-counter pain medications like ibuprofen to reduce pain and inflammation. Mild knee injuries may need 1-2 weeks to heal. For moderate to severe knee injuries, seek medical attention for proper diagnosis and treatment plan. Do not try to 'work through' knee pain as this can worsen the injury.",
    "emergency_signs": ["inability to bear weight on the affected leg", "severe deformity", "knee looks dislocated", "severe swelling within first few hours", "persistent pain despite rest and medication", "feeling a pop followed by immediate pain and swelling"],
    "visual_indicators": ["visible swelling around kneecap", "bruising around knee joint", "awkward knee positioning", "inability to bend or straighten knee", "person holding or protecting knee"]
  },
  {
    "id": "ankle_injuries",
    "title": "Ankle Sprains and Injuries",
    "symptoms": ["pain and tenderness", "swelling", "bruising", "limited mobility", "instability", "popping sound during injury"],
    "content": "For ankle sprains, follow the RICE method immediately: Rest and avoid putting weight on the ankle, apply Ice for 15-20 minutes every 2-3 hours, Compress with an elastic wrap (not too tight), and Elevate the ankle above heart level when possible. Over-the-counter pain relievers can help manage pain and reduce inflammation. Mild sprains may heal within 1-3 weeks. For moderate to severe sprains, immobilization with a brace may be necessary. Gradually reintroduce activity as the ankle heals, starting with range-of-motion exercises. Balance exercises help prevent future sprains.",
    "emergency_signs": ["inability to bear any weight", "severe deformity", "pain directly over the ankle bones", "numbness in the foot", "cold or bluish foot", "pain that doesn't improve with rest"],
    "visual_indicators": ["visible swelling around ankle bones", "bruising or discoloration", "foot turned at abnormal angle", "person unable to put weight on affected foot"]
  },
  {
    "id": "choking",
    "title": "Choking",
    "symptoms": ["inability to talk", "difficulty breathing", "inability to cough forcefully", "skin, lips and nails turning blue or dusky", "loss of consciousness"],
    "content": "For adults and children over 1 year: Stand behind the person and wrap your arms around their waist. Tip the person slightly forward. Make a fist with one hand and place it slightly above the person's navel. Grasp your fist with the other hand. Press hard into the abdomen with a quick, upward thrust, as if trying to lift the person up. Repeat until the object is expelled. If the person becomes unconscious, lower them to the ground and begin CPR if you're trained.",
    "emergency_signs": ["inability to breathe", "turning blue", "loss of consciousness"],
    "visual_indicators": ["universal choking sign (hands clutching throat)", "inability to speak", "panicked expression", "blue-tinged lips or skin"]
  },
  {
    "id": "bleeding",
    "title": "Severe Bleeding",
    "symptoms": ["blood spurting from wound", "blood soaking through clothing or bandages", "bleeding that doesn't stop with direct pressure"],
    "content": "Apply firm, direct pressure on the wound with a clean cloth, bandage, or your hand if nothing else is available. If blood soaks through, add more material without removing the original dressing. If possible, elevate the wounded area above the heart. If bleeding is from an arm or leg and continues despite direct pressure, apply pressure to the appropriate artery (brachial artery for arm injuries, femoral artery for leg injuries). As a last resort for life-threatening bleeding from a limb, a tourniquet may be used if you have proper training.",
    "emergency_signs": ["severe, uncontrolled bleeding", "amputation", "deep wounds with visible fat or muscle", "embedded objects in the wound"],
    "visual_indicators": ["visible blood flow", "blood-soaked clothing", "blood pool or spatter", "pale skin from blood loss"]
  },
  {
    "id": "fractures",
    "title": "Fractures (Broken Bones)",
    "symptoms": ["pain", "swelling", "bruising", "deformity", "inability to use the affected limb"],
    "content": "Don't move the person except if necessary to avoid further injury. If you must move them, stabilize the injured area first. Stop any bleeding by applying pressure. Immobilize the injured area using a splint if available. Apply ice packs wrapped in a cloth to limit swelling and relieve pain. Treat for shock if necessary by laying the person flat, elevating the feet about 12 inches (unless this causes pain or the injury is to the head, neck, back or leg), and covering them with a coat or blanket.",
    "emergency_signs": ["bone protruding through the skin", "severe deformity", "loss of pulse beyond the injury", "bluish color of the injured area", "numbness or tingling beyond the injury"],
    "visual_indicators": ["visible deformity or unusual angle", "swelling", "bruising", "protected positioning of limb", "inability to use limb normally"]
  },
  {
    "id": "concussion",
    "title": "Concussion and Head Injuries",
    "symptoms": ["headache", "confusion", "dizziness", "ringing in ears", "nausea or vomiting", "fatigue", "memory problems", "temporary loss of consciousness"],
    "content": "For a suspected concussion, have the person rest both physically and mentally. Monitor them closely for the first 24 hours and don't leave them alone. Wake them every 2-3 hours during the night to check alertness. Avoid activities that require concentration or physical exertion. Apply cold packs to swollen areas for 20 minutes at a time. Take acetaminophen (Tylenol) for headaches, but avoid ibuprofen and aspirin which may increase bleeding risk. Return to normal activities gradually under medical supervision. Complete recovery may take days to weeks.",
    "emergency_signs": ["repeated vomiting", "seizures", "inability to recognize people or places", "increasing confusion", "weakness or numbness in limbs", "decreased coordination", "slurred speech", "one pupil larger than the other", "clear fluid or blood from ears or nose"],
    "visual_indicators": ["visible injury to head", "unequal pupil size", "disoriented behavior", "drowsiness", "loss of balance", "sluggish responses"]
  },
  {
    "id": "heart_attack",
    "title": "Heart Attack",
    "symptoms": ["chest pain or pressure", "pain spreading to shoulder, arm, back, neck, or jaw", "shortness of breath", "cold sweat", "nausea", "lightheadedness"],
    "content": "Call emergency services immediately. Have the person sit down, rest, and try to keep calm. Loosen any tight clothing. If the person is not allergic to aspirin and has no other contraindications, give them an adult aspirin (325 mg) or 2-4 low-dose aspirin (81 mg) to chew. If the person stops breathing or has no pulse, begin CPR if you're trained. If an automated external defibrillator (AED) is available and the person is unconscious with no pulse, use it according to the device instructions.",
    "emergency_signs": ["chest pain lasting more than a few minutes", "chest pain that doesn't respond to rest or nitroglycerin", "loss of consciousness", "no breathing or pulse"],
    "visual_indicators": ["clutching chest", "pale or gray skin color", "sweating profusely", "distressed facial expression", "shortness of breath"]
  },
  {
    "id": "stroke",
    "title": "Stroke",
    "symptoms": ["sudden numbness or weakness in face, arm, or leg (especially on one side)", "sudden confusion or trouble speaking", "sudden trouble seeing", "sudden trouble walking, dizziness, or loss of balance", "sudden severe headache"],
    "content": "Remember the acronym FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Note the time when symptoms first appeared. Don't give the person anything to eat or drink. If the person is unconscious, lay them on their side with their head slightly elevated. If they're not breathing or don't have a pulse, begin CPR if you're trained.",
    "emergency_signs": ["any stroke symptoms, even if they seem to go away", "loss of consciousness", "seizures", "severe headache with no known cause"],
    "visual_indicators": ["facial drooping on one side", "arm drifting downward when raised", "slurred or garbled speech", "uneven smile", "confusion or disorientation"]
  },
  {
    "id": "poisoning",
    "title": "Poisoning",
    "symptoms": ["nausea or vomiting", "difficulty breathing", "drowsiness or confusion", "burns or redness around the mouth", "chemical smell on breath", "burns, stains, or odors on the person or nearby objects"],
    "content": "Call poison control immediately at 1-800-222-1222 (US) or your local emergency number. If the person has collapsed or is not breathing, call emergency services. Remove the person from the source of poison if safe to do so. If poison is on the skin, remove contaminated clothing and rinse skin with running water for 15-20 minutes. If poison is in the eye, flush with lukewarm water for 20 minutes. If poison was inhaled, get the person to fresh air immediately. Do not induce vomiting or give anything to drink unless directed by poison control.",
    "emergency_signs": ["loss of consciousness", "difficulty breathing", "seizures", "extreme pain or burning sensation"],
    "visual_indicators": ["empty medication containers", "chemical containers nearby", "burns around mouth", "unusual odors", "vomiting"]
  },
  {
    "id": "heat_exhaustion",
    "title": "Heat Exhaustion and Heat Stroke",
    "symptoms": ["heavy sweating", "cold, pale, clammy skin", "fast, weak pulse", "nausea or vomiting", "muscle cramps", "headache", "fainting", "high body temperature (above 103°F)", "hot, red, dry skin", "rapid, strong pulse"],
    "content": "For heat exhaustion: Move the person to a cool place. Loosen clothing and apply cool, wet cloths to the body or have the person take a cool bath. Give sips of water if the person is fully conscious and not vomiting. For heat stroke (a medical emergency): Call emergency services immediately. Move the person to a cooler environment. Reduce body temperature with cool cloths or a cool bath. Do not give the person anything to drink. Monitor vital signs until emergency help arrives.",
    "emergency_signs": ["body temperature above 103°F", "hot, red, dry skin (no sweating)", "rapid, strong pulse", "confusion or unconsciousness"],
    "visual_indicators": ["profuse sweating", "flushed or extremely red face", "disorientation", "lack of coordination", "collapse"]
  },
  {
    "id": "sports_injuries",
    "title": "Sports-Related Injuries",
    "symptoms": ["pain during activity", "swelling", "reduced range of motion", "weakness", "instability in a joint", "popping or crunching sounds", "visible deformity"],
    "content": "For most acute sports injuries, follow the PRICE protocol: Protection (prevent further injury), Rest (avoid using the injured area), Ice (apply cold packs for 15-20 minutes every 2-3 hours), Compression (use elastic bandage to reduce swelling), and Elevation (keep injured area above heart level when possible). Over-the-counter pain medications can help manage pain and inflammation. Most minor sports injuries improve within 2 weeks with proper care. Return to activity gradually, starting at about 50% of normal intensity and increasing slowly if pain doesn't return. For injuries that don't improve within a week or severely impact function, seek medical evaluation.",
    "emergency_signs": ["suspected fracture or dislocation", "inability to bear weight", "significant joint instability", "severe swelling or pain", "numbness or tingling beyond the injury site", "visible deformity"],
    "visual_indicators": ["limping or altered gait", "holding or favoring a body part", "swelling or bruising around joint", "limited movement", "visible deformity"]
  }
];

// Vector embeddings for each knowledge base entry
// These are simplified representations for demonstration purposes
// In a real implementation, you would use a proper embedding model
export const knowledgeBaseEmbeddings: Record<string, number[]> = {
  "cuts_scrapes": [0.2, 0.1, 0.8, 0.3, 0.5, 0.2, 0.1, 0.9, 0.3, 0.4],
  "burns": [0.7, 0.2, 0.3, 0.8, 0.1, 0.9, 0.2, 0.3, 0.1, 0.5],
  "sprains_strains": [0.3, 0.8, 0.2, 0.1, 0.7, 0.3, 0.9, 0.2, 0.4, 0.1],
  "knee_injuries": [0.35, 0.85, 0.2, 0.15, 0.75, 0.3, 0.95, 0.25, 0.4, 0.15],
  "ankle_injuries": [0.32, 0.82, 0.22, 0.12, 0.72, 0.32, 0.92, 0.22, 0.42, 0.12],
  "choking": [0.1, 0.3, 0.5, 0.2, 0.9, 0.1, 0.4, 0.3, 0.7, 0.2],
  "bleeding": [0.9, 0.1, 0.3, 0.2, 0.4, 0.8, 0.1, 0.5, 0.3, 0.2],
  "fractures": [0.2, 0.7, 0.1, 0.5, 0.3, 0.2, 0.8, 0.1, 0.4, 0.6],
  "concussion": [0.25, 0.65, 0.15, 0.45, 0.35, 0.25, 0.75, 0.15, 0.45, 0.55],
  "heart_attack": [0.5, 0.2, 0.4, 0.1, 0.8, 0.3, 0.2, 0.7, 0.1, 0.9],
  "stroke": [0.4, 0.1, 0.7, 0.3, 0.2, 0.5, 0.1, 0.8, 0.3, 0.6],
  "poisoning": [0.1, 0.5, 0.3, 0.7, 0.2, 0.4, 0.6, 0.1, 0.8, 0.3],
  "heat_exhaustion": [0.6, 0.3, 0.1, 0.4, 0.2, 0.7, 0.3, 0.5, 0.2, 0.8],
  "sports_injuries": [0.3, 0.75, 0.25, 0.15, 0.7, 0.35, 0.9, 0.25, 0.45, 0.2]
}; 