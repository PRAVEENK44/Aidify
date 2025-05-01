import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-1.5-pro";

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
    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API key");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing API key" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Received medical query:", query);

    // Construct system prompt to ensure responsible medical responses
    const systemPrompt = `You are a highly advanced AI medical assistant specializing in injury detection and medical information. 
    Your primary goal is to analyze user-provided symptoms, injuries, or medical queries with the highest accuracy.
    
    Guidelines:
    - Provide fact-based, verified responses aligned with the latest medical guidelines and research
    - Suggest possible diagnoses, first aid measures, and when to seek professional medical attention
    - Maintain a professional, empathetic, and reassuring tone
    - Keep responses clear, concise, and error-free
    - Always include a disclaimer about consulting healthcare professionals
    - Never provide definitive medical diagnoses
    - Clearly indicate when information is general advice versus emergency guidance
    - For serious conditions, emphasize the importance of seeking immediate medical help
    
    Important: If a situation requires a medical professional, the user should be encouraged to consult a doctor immediately.`;

    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          },
          {
            role: "model",
            parts: [{ text: "I understand my role and responsibilities as a medical assistant AI. I'll provide factual, evidence-based information while maintaining appropriate caution and emphasizing the importance of professional medical consultation." }]
          },
          {
            role: "user", 
            parts: [{ text: query }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await response.json();
    console.log("Gemini API response received");

    // Extract the response text
    let responseText;
    try {
      responseText = data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      console.error("Raw response:", JSON.stringify(data));
      
      if (data.error) {
        return new Response(
          JSON.stringify({ error: `API Error: ${data.error.message || "Unknown error"}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      responseText = "I apologize, but I encountered an issue processing your medical query. Please try again or rephrase your question.";
    }

    return new Response(
      JSON.stringify({ 
        answer: responseText,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in medical-assistant function:", error);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
