import { AlertTriangle, Info, Shield, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Disclaimer() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={cn(
      "px-6 py-5 border-t border-gray-200 transition-all duration-300",
      "bg-gradient-to-r from-gray-50 to-gray-100",
      expanded ? "rounded-b-lg" : ""
    )}>
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-full">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 mb-1 flex items-center gap-2">
            Medical Disclaimer
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Important</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            This information is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always seek the advice of a qualified healthcare provider with any questions you may have.
            In case of serious injuries or medical emergencies, call emergency services immediately.
          </p>
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors mt-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show more details
              </>
            )}
          </button>
          
          {expanded && (
            <div className="mt-4 space-y-4 animate-fade-in">
              <div className="rounded-lg border border-gray-200 p-3 bg-white">
                <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-gray-700">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  Medical Information Sources
                </h4>
                <p className="text-xs text-gray-600">
                  The first aid guidance provided by Aidify is sourced from established medical authorities 
                  including the American Red Cross, Mayo Clinic, and World Health Organization. 
                  This application uses AI to match your specific injury with appropriate, 
                  evidence-based first aid protocols.
                </p>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-3 bg-white">
                <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-gray-700">
                  <Shield className="h-4 w-4 text-gray-500" />
                  Limitations of AI Medical Guidance
                </h4>
                <p className="text-xs text-gray-600">
                  While our AI system uses advanced techniques to identify injuries and provide appropriate 
                  first aid instructions, it has limitations. The system cannot perform physical examinations, 
                  access your medical history, or account for all potential complications. Its recommendations 
                  should be considered as general guidance, not personalized medical advice.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield className="h-3.5 w-3.5 text-gray-400" />
              <span>Powered by Pathway RAG technology</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Info className="h-3.5 w-3.5 text-gray-400" />
              <span>Updated with the latest medical guidelines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
