
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, RotateCw, Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

type ChatInputProps = {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
};

// Sample suggested questions
const suggestedQuestions = [
  "What are the symptoms of a concussion?",
  "How to treat a minor burn at home?",
  "What should I do for a sprained ankle?",
  "Signs of dehydration to watch for",
  "When should I seek emergency care?"
];

export function ChatInput({ input, setInput, handleSendMessage, isLoading }: ChatInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleQuestionSelect = (question: string) => {
    setInput(question);
    setShowSuggestions(false);
  };
  
  return (
    <motion.div 
      className="p-6 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      {/* Suggested questions */}
      {showSuggestions && (
        <motion.div 
          className="mb-4 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuestionSelect(question)}
              className="bg-white hover:bg-blue-50 text-purple-700 border-purple-200 text-sm px-4 py-2 rounded-full flex-shrink-0 hover:scale-105 transition-all"
            >
              {question}
            </Button>
          ))}
        </motion.div>
      )}
      
      <form onSubmit={handleSendMessage} className="space-y-4">
        <div className="flex gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aidie about health concerns..."
            className="flex-1 resize-none rounded-xl border-purple-300 focus:border-purple-500 min-h-[80px] p-4 shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm"
            rows={3}
          />
          <div className="flex flex-col gap-2 self-end">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="h-10 w-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 mb-2"
                title="Show suggested questions"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {isLoading ? (
                  <RotateCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Send className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <motion.div 
            className="flex items-center gap-1 text-xs text-purple-600 opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
          >
            <Sparkles className="h-3 w-3" />
            <span>Powered by advanced AI</span>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
