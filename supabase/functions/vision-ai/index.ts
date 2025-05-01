
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Google Cloud Vision API endpoint
const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

// Service account key - stored as a secret in Supabase
const serviceAccountKey = JSON.parse(Deno.env.get("GOOGLE_VISION_CREDENTIALS") || "{}");

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
  try {
    // Create a JWT for Google authentication
    const jwtHeader = {
      alg: "RS256",
      typ: "JWT",
      kid: serviceAccountKey.private_key_id
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtClaimSet = {
      iss: serviceAccountKey.client_email,
      sub: serviceAccountKey.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600, // 1 hour
      scope: "https://www.googleapis.com/auth/cloud-vision"
    };

    // Encode the JWT parts
    const base64Header = btoa(JSON.stringify(jwtHeader)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const base64ClaimSet = btoa(JSON.stringify(jwtClaimSet)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    
    // Create the JWT payload that needs to be signed
    const jwtPayload = `${base64Header}.${base64ClaimSet}`;
    
    // Sign the JWT with the private key
    const encoder = new TextEncoder();
    const privateKey = serviceAccountKey.private_key;
    
    // Convert PEM private key to CryptoKey
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = privateKey.substring(
      privateKey.indexOf(pemHeader) + pemHeader.length,
      privateKey.indexOf(pemFooter)
    ).replace(/\s/g, "");
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );
    
    // Sign the JWT payload
    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      importedKey,
      encoder.encode(jwtPayload)
    );
    
    // Convert signature to Base64URL format
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    // Combine all parts to form the signed JWT
    const signedJwt = `${jwtPayload}.${signatureBase64}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error("Error getting access token:", tokenData.error_description);
      throw new Error(`Failed to get access token: ${tokenData.error_description}`);
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    throw error;
  }
}

// Handle the image analysis with Google Cloud Vision API
async function analyzeImage(imageBase64: string) {
  try {
    // Get Google Cloud access token
    const accessToken = await getAccessToken();
    
    // Prepare the request payload for Vision API
    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 15
            },
            {
              type: "IMAGE_PROPERTIES",
              maxResults: 5
            },
            {
              type: "OBJECT_LOCALIZATION",
              maxResults: 10
            },
            {
              type: "TEXT_DETECTION",
              maxResults: 15
            },
            {
              type: "FACE_DETECTION",
              maxResults: 5
            },
            {
              type: "SAFE_SEARCH_DETECTION"
            }
          ]
        }
      ]
    };
    
    // Call the Vision API
    const response = await fetch(VISION_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Vision API error:", data.error);
      throw new Error(`Vision API error: ${data.error.message}`);
    }
    
    console.log("Raw Vision API response:", JSON.stringify(data));
    
    return analyzeVisionResults(data);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}

// Process Vision API results to determine injury type
function analyzeVisionResults(visionResults: any) {
  try {
    console.log("Processing Vision API results");
    const labels = visionResults.responses[0]?.labelAnnotations || [];
    const objects = visionResults.responses[0]?.localizedObjectAnnotations || [];
    const textAnnotations = visionResults.responses[0]?.textAnnotations || [];
    const faceAnnotations = visionResults.responses[0]?.faceAnnotations || [];
    const safeSearch = visionResults.responses[0]?.safeSearchAnnotation || {};
    const imageProperties = visionResults.responses[0]?.imagePropertiesAnnotation || {};
    
    // Extract all detected labels and text
    const detectedLabels = labels.map((label: any) => label.description.toLowerCase());
    const detectedObjects = objects.map((obj: any) => obj.name.toLowerCase());
    const detectedTexts = textAnnotations.map((text: any) => text.description.toLowerCase());
    
    console.log("Detected labels:", detectedLabels);
    console.log("Detected objects:", detectedObjects);
    console.log("Detected texts:", detectedTexts);
    
    // Combined list of all detected elements
    const allDetected = [...detectedLabels, ...detectedObjects, ...detectedTexts];
    
    // Check for dominant colors - red colors might indicate blood
    let hasRedDominance = false;
    let redScore = 0;
    
    if (imageProperties && imageProperties.dominantColors && imageProperties.dominantColors.colors) {
      imageProperties.dominantColors.colors.forEach((color: any) => {
        const { red, green, blue } = color.color;
        // Check if the color is in the red spectrum (more red than other colors)
        if (red > 150 && red > green * 1.5 && red > blue * 1.5) {
          redScore += color.pixelFraction * 100;
          console.log(`Found red color with fraction ${color.pixelFraction}, current red score: ${redScore}`);
        }
      });
      
      hasRedDominance = redScore > 5; // If more than 5% of the image has red dominance
      console.log(`Red dominance analysis: ${hasRedDominance} with score ${redScore}`);
    }
    
    // Enhanced injury detection - check for blood-related terms
    const bloodTerms = ["blood", "bleeding", "wound", "cut", "laceration", "injury", "trauma", 
                        "red", "gore", "head wound", "bloody", "bleed", "red fluid", "abrasion"];
    
    let bloodMentionCount = 0;
    bloodTerms.forEach(term => {
      allDetected.forEach(detected => {
        if (detected.includes(term)) {
          bloodMentionCount++;
          console.log(`Blood-related term found: "${detected}" includes "${term}"`);
        }
      });
    });
    
    // Violence detection from safeSearch may indicate injury
    const violenceScore = safeSearch.violence || "UNLIKELY";
    console.log("Violence score from SafeSearch:", violenceScore);
    
    // Face detection can help with head injuries
    let hasFace = faceAnnotations && faceAnnotations.length > 0;
    console.log("Face detected:", hasFace);
    
    // Define keywords for different injury types with weighted scoring
    const injuryKeywords = {
      "Bleeding": {
        keywords: ["blood", "bleeding", "hemorrhage", "clot", "bandage", "pressure", "gauze", "red fluid"],
        score: 0,
        baseWeight: 2 // Higher base weight for bleeding
      },
      "Cut/Laceration": {
        keywords: ["cut", "laceration", "knife", "blade", "scissors", "sharp", "wound", "gash", "slice"],
        score: 0,
        baseWeight: 1.5
      },
      "Head Injury": {
        keywords: ["head", "concussion", "skull", "brain", "trauma", "bump", "consciousness", "dizziness", "headache"],
        score: 0,
        baseWeight: 1.2
      },
      "Burn Injury": {
        keywords: ["burn", "fire", "scald", "flame", "blister", "heat", "thermal", "radiation", "chemical burn"],
        score: 0,
        baseWeight: 1
      },
      "Fracture": {
        keywords: ["fracture", "broken", "bone", "crack", "splint", "cast", "x-ray", "joint", "dislocation"],
        score: 0,
        baseWeight: 1
      },
      "Sprain/Strain": {
        keywords: ["sprain", "strain", "twist", "joint", "ligament", "tendon", "muscle", "swelling", "bruise", "ankle"],
        score: 0,
        baseWeight: 0.8
      },
      "Eye Injury": {
        keywords: ["eye", "vision", "cornea", "iris", "pupil", "blindness", "sight", "optical", "contact", "foreign object"],
        score: 0,
        baseWeight: 0.7
      },
      "Allergic Reaction": {
        keywords: ["allergy", "reaction", "rash", "hives", "itching", "swelling", "anaphylaxis", "food allergy"],
        score: 0,
        baseWeight: 0.6
      },
      "Minor Wound": {
        keywords: ["scratch", "abrasion", "scrape", "minor", "small wound", "band-aid", "superficial"],
        score: 0,
        baseWeight: 0.5 // Lower base weight for minor wounds
      }
    };
    
    // Score each injury type based on keyword matches
    for (const [injuryType, data] of Object.entries(injuryKeywords)) {
      data.keywords.forEach(keyword => {
        allDetected.forEach(detected => {
          if (detected.includes(keyword)) {
            const keywordScore = data.baseWeight;
            data.score += keywordScore;
            console.log(`Match found: "${detected}" includes "${keyword}" for ${injuryType}, added score ${keywordScore}`);
          }
        });
      });
      
      // Apply context-based boosting factors
      if (injuryType === "Bleeding" || injuryType === "Cut/Laceration") {
        // If we detected red colors and some blood mentions, boost bleeding/cut scores
        if (hasRedDominance) {
          const redBoost = 3.0;
          data.score += redBoost;
          console.log(`Boosting ${injuryType} score by ${redBoost} due to red color dominance`);
        }
        
        if (bloodMentionCount > 0) {
          const bloodBoost = bloodMentionCount * 1.5;
          data.score += bloodBoost;
          console.log(`Boosting ${injuryType} score by ${bloodBoost} due to ${bloodMentionCount} blood term mentions`);
        }
        
        if (violenceScore === "POSSIBLE" || violenceScore === "LIKELY" || violenceScore === "VERY_LIKELY") {
          const violenceBoost = 2.0;
          data.score += violenceBoost;
          console.log(`Boosting ${injuryType} score by ${violenceBoost} due to violence detection`);
        }
      }
      
      // Boost head injuries if a face is detected
      if (injuryType === "Head Injury" && hasFace) {
        const faceBoost = 1.5;
        data.score += faceBoost;
        console.log(`Boosting ${injuryType} score by ${faceBoost} due to face detection`);
      }
    }
    
    console.log("Injury type scores:", Object.entries(injuryKeywords).map(([type, data]) => `${type}: ${data.score}`));
    
    // Find the injury type with the highest score
    let maxScore = 0;
    let detectedInjuryType = "Minor Wound"; // Default
    
    for (const [injuryType, data] of Object.entries(injuryKeywords)) {
      if (data.score > maxScore) {
        maxScore = data.score;
        detectedInjuryType = injuryType;
      }
    }
    
    // If no significant matches, return default
    if (maxScore === 0) {
      console.log("No specific injury detected, defaulting to Minor Wound");
      return { injuryType: "Minor Wound", confidence: 0.6, matchedKeywords: [], detectionDetails: { redDominance: hasRedDominance, bloodMentions: bloodMentionCount } };
    }
    
    // Calculate confidence (0.6 base + up to 0.4 based on keyword matches)
    const confidence = Math.min(0.6 + (maxScore * 0.04), 0.99);
    
    // Get the matched keywords for explanation
    const matchedKeywords = injuryKeywords[detectedInjuryType].keywords.filter(keyword => 
      allDetected.some(detected => detected.includes(keyword))
    );
    
    console.log(`Detected injury: ${detectedInjuryType} with confidence ${confidence}`);
    console.log("Matched keywords:", matchedKeywords);
    
    return {
      injuryType: detectedInjuryType,
      confidence: confidence,
      matchedKeywords: matchedKeywords,
      detectionDetails: {
        redDominance: hasRedDominance,
        bloodMentions: bloodMentionCount,
        hasFace: hasFace,
        violenceScore: violenceScore
      }
    };
  } catch (error) {
    console.error("Error in analyzing Vision results:", error);
    return { 
      injuryType: "Minor Wound", 
      confidence: 0.5,
      matchedKeywords: [],
      error: error.message,
      detectionDetails: { error: true }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing image data" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // Analyze the image with Google Cloud Vision
    const result = await analyzeImage(base64Data);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in vision-ai function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `An error occurred during image analysis: ${error.message}`,
        injuryType: "Minor Wound", // Fallback
        confidence: 0.5
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
