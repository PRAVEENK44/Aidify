
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    // Prepare the request payload for Gemini API with enhanced prompt
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a medical professional specializing in injury assessment from images. Please analyze this image of a potential injury and tell me the following details in JSON format only:

1) injuryType: Should be one of the following specific categories:
   - Bleeding (if you see active bleeding or blood)
   - Cut/Laceration (if you see a cut in the skin)
   - Burn Injury (if you see burns or scalds)
   - Fracture (if you see signs of broken bones)
   - Sprain/Strain (if you see swelling of joints without cuts/blood)
   - Head Injury (if injury is on the head)
   - Eye Injury (if injury affects eyes)
   - Allergic Reaction (if you see signs of allergies/rash)
   - Minor Wound (for small scratches)

2) severity: low, medium, or high
3) location: specific body part affected
4) bloodLevel: none, minimal, moderate, or severe
5) confidence: number between 0-1 indicating your confidence
6) detectionDetails: object containing:
   - detectedObjects: array of objects visible in the image
   - detectedColors: array of dominant colors (especially note red/blood colors)
   - foreignObjects: boolean - true if any foreign object is embedded in the wound

IMPORTANT GUIDANCE:
- If you see ANY blood, prioritize "Bleeding" or "Cut/Laceration" as the injuryType
- If blood is visible, bloodLevel should not be "none"
- If there's significant blood, severity should be "high"
- When in doubt about an injury with blood, classify as "Bleeding" to ensure proper emergency care
- Always respond in valid JSON format only, no other text

Now analyze the image carefully:`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    };
    
    console.log("Calling Gemini API for image analysis...");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    
    // Call the Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error(`Gemini API error: ${data.error?.message || JSON.stringify(data)}`);
    }
    
    console.log("Gemini API response received");
    
    // Extract the text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error("No text response from Gemini API");
    }
    
    console.log("Raw Gemini response:", textResponse);
    
    // Extract JSON from the text response
    let jsonResponse;
    try {
      // Look for JSON in the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, use text analysis to extract information
        jsonResponse = parseNonJsonResponse(textResponse);
      }
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      jsonResponse = parseNonJsonResponse(textResponse);
    }
    
    // Default response if parsing fails
    const defaultResponse = {
      injuryType: "Bleeding", // Default to Bleeding for safety
      severity: "medium",
      location: "Unknown",
      bloodLevel: "minimal",
      confidence: 0.5,
      detectionDetails: {
        geminiDetails: {
          detectedObjects: [],
          detectedColors: [],
          detectedKeywords: []
        }
      }
    };
    
    // Construct the final response
    const finalResponse = {
      injuryType: jsonResponse.injuryType || defaultResponse.injuryType,
      confidence: parseFloat(jsonResponse.confidence) || defaultResponse.confidence,
      details: {
        severity: jsonResponse.severity || defaultResponse.severity,
        location: jsonResponse.location || defaultResponse.location,
        bloodLevel: jsonResponse.bloodLevel || defaultResponse.bloodLevel,
        foreignObjects: jsonResponse.foreignObjects || false
      },
      detectionDetails: {
        geminiDetails: {
          detectedObjects: jsonResponse.detectionDetails?.detectedObjects || [],
          detectedColors: jsonResponse.detectionDetails?.detectedColors || [],
          detectedKeywords: extractKeywords(textResponse)
        }
      }
    };
    
    // Enhanced blood detection logic
    if (finalResponse.detectionDetails.geminiDetails.detectedColors) {
      const hasBloodColors = finalResponse.detectionDetails.geminiDetails.detectedColors.some(
        color => color.toLowerCase().includes('red') || 
                color.toLowerCase().includes('blood') || 
                color.toLowerCase().includes('crimson') ||
                color.toLowerCase().includes('maroon')
      );
      
      const mentionsBlood = textResponse.toLowerCase().includes("blood") || 
                            textResponse.toLowerCase().includes("bleeding");
                            
      // Override to Bleeding if blood is detected but injury type doesn't reflect it
      if ((hasBloodColors || mentionsBlood) && 
          finalResponse.injuryType !== "Bleeding" && 
          finalResponse.injuryType !== "Cut/Laceration") {
        console.log("Blood detected but injury not classified correctly - overriding to Bleeding");
        finalResponse.injuryType = "Bleeding";
        finalResponse.details.bloodLevel = "moderate"; // At least moderate if blood is visible
        finalResponse.details.severity = "high";
        finalResponse.confidence = Math.max(finalResponse.confidence, 0.85);
      }
      
      // Ensure bloodLevel is never "none" if blood colors are detected
      if (hasBloodColors && finalResponse.details.bloodLevel === "none") {
        finalResponse.details.bloodLevel = "minimal";
      }
    }

    console.log("Final analyzed result:", finalResponse);
    
    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in gemini-analysis function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `An error occurred during image analysis: ${error.message}`,
        injuryType: "Bleeding", // Default to Bleeding when we see a serious error, better safe than sorry
        confidence: 0.7,
        details: {
          severity: "high",
          location: "Undetermined",
          bloodLevel: "moderate",
          foreignObjects: false
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
  const keywords = [];
  const medicalTerms = [
    "blood", "bleeding", "cut", "laceration", "wound", "injury", "trauma", 
    "burn", "fracture", "sprain", "strain", "swelling", "bruise", 
    "pain", "discomfort", "redness", "infection", "puncture", "abrasion",
    "emergency", "broken", "bone", "severe", "critical", "open wound"
  ];
  
  for (const term of medicalTerms) {
    if (text.toLowerCase().includes(term)) {
      keywords.push(term);
    }
  }
  
  return keywords;
}

// Function to parse textual response when JSON parsing fails
function parseNonJsonResponse(text: string) {
  const result: any = {
    detectionDetails: {
      detectedObjects: [],
      detectedColors: []
    }
  };
  
  // Try to identify injury type
  if (text.match(/bleed|blood|hemorrhage/i)) {
    result.injuryType = "Bleeding";
    result.bloodLevel = "severe";
    result.severity = "high";
    result.confidence = 0.9;
  } else if (text.match(/cut|laceration|gash/i)) {
    result.injuryType = "Cut/Laceration";
    result.bloodLevel = "moderate";
    result.severity = "medium";
    result.confidence = 0.85;
  } else if (text.match(/burn|scald/i)) {
    result.injuryType = "Burn Injury";
    result.confidence = 0.8;
  } else if (text.match(/fracture|broken/i)) {
    result.injuryType = "Fracture";
    result.confidence = 0.75;
  } else if (text.match(/sprain|strain/i)) {
    result.injuryType = "Sprain/Strain";
    result.confidence = 0.7;
  } else {
    result.injuryType = "Bleeding"; // Default when uncertain - better to be safe
    result.confidence = 0.6;
  }
  
  // Try to determine severity
  if (text.match(/severe|serious|critical|emergency|urgent/i)) {
    result.severity = "high";
  } else if (text.match(/moderate|medium/i)) {
    result.severity = "medium";
  } else {
    result.severity = "low";
  }
  
  // Try to determine location
  const bodyParts = ["arm", "leg", "hand", "foot", "head", "face", "chest", "back", "abdomen", "neck", "finger", "ankle", "wrist", "shoulder", "elbow", "knee"];
  for (const part of bodyParts) {
    if (text.toLowerCase().includes(part)) {
      result.location = part;
      break;
    }
  }
  if (!result.location) {
    result.location = "Undetermined";
  }
  
  // Extract any colors mentioned
  const colorRegex = /red|blue|black|purple|yellow|white|pink|brown|crimson|maroon/gi;
  const colorMatches = text.toLowerCase().match(colorRegex);
  if (colorMatches) {
    result.detectionDetails.detectedColors = [...new Set(colorMatches)];
  }
  
  return result;
}
