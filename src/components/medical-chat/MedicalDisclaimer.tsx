
import React from "react";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function MedicalDisclaimer() {
  return (
    <motion.div 
      className="p-3 bg-gradient-to-r from-amber-50 to-pink-50 border-t border-amber-200 text-amber-800 text-xs"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3 w-3 flex-shrink-0 animate-pulse" />
        <p>
          Aidify provides general health information, not professional medical advice. Always consult qualified healthcare providers.
        </p>
      </div>
    </motion.div>
  );
}

export default MedicalDisclaimer;
