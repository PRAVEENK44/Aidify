
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Heart } from "lucide-react";
import { motion } from "framer-motion";

type LoadingStateProps = {
  isVisible: boolean;
};

export function LoadingState({ isVisible }: LoadingStateProps) {
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className="flex justify-start gap-6 my-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
        <Heart className="h-6 w-6 text-purple-300 animate-pulse" />
      </div>
      <div className="max-w-3xl bg-purple-50 rounded-2xl p-6 rounded-tl-none">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </motion.div>
  );
}

type ErrorMessageProps = {
  error: string | null;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  
  return (
    <motion.div 
      className="flex justify-center my-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4 max-w-xl shadow-sm">
        <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Error getting response</p>
          <p className="text-red-600 text-sm mt-3">{error}</p>
          <p className="text-xs text-gray-500 mt-4">
            Please try again or rephrase your question
          </p>
        </div>
      </div>
    </motion.div>
  );
}
