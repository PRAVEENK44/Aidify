
import React from "react";
import ReactMarkdown from 'react-markdown';
import { Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type MessageProps = {
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export function ChatMessage({ content, role, timestamp }: MessageProps) {
  const isAssistant = role === "assistant";
  
  return (
    <div
      className={cn(
        "flex gap-6 transition-all my-8",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && (
        <motion.div 
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <Heart className="h-6 w-6 text-purple-600" />
        </motion.div>
      )}
      
      <motion.div
        className={cn(
          "max-w-3xl rounded-2xl p-6 shadow-sm",
          isAssistant 
            ? "bg-purple-50 text-gray-800 rounded-tl-none border border-purple-100" 
            : "bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-tr-none"
        )}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className={cn(
          "prose prose-sm max-w-none",
          !isAssistant && "prose-invert"
        )}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div
          className={cn(
            "text-xs mt-4 flex justify-between items-center",
            isAssistant ? "text-gray-500" : "text-purple-100"
          )}
        >
          <span className="font-medium">{isAssistant ? 'Aidie' : 'You'}</span>
          <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </motion.div>
      
      {!isAssistant && (
        <motion.div 
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-sm"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <User className="h-6 w-6 text-white" />
        </motion.div>
      )}
    </div>
  );
}
