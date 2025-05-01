
import React, { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { LoadingState, ErrorMessage } from "./ChatFeedback";
import { Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  setInput?: (input: string) => void;
};

// Sample suggested questions
const commonQuestions = [
  "What are the symptoms of a concussion?",
  "How to treat a minor burn at home?",
  "What should I do for a sprained ankle?",
  "Signs of dehydration to watch for",
  "When should I seek emergency care?"
];

export function MessageList({ messages, isLoading, error, setInput }: MessageListProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of messages
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    if (setInput) {
      setInput(question);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      {messages.length === 0 && !isLoading && !error && (
        <motion.div 
          className="h-full flex flex-col items-center justify-center text-center p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-6"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Heart className="h-10 w-10 text-purple-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-800">Welcome to Aidie</h3>
          <p className="text-gray-500 max-w-md mt-2 mb-6">
            Ask me anything about medical symptoms, treatments, or health concerns. I'm here to help!
          </p>
          
          {/* Common questions */}
          <div className="w-full max-w-md">
            <div className="text-left mb-3 text-sm font-medium text-purple-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Common health questions:</span>
            </div>
            <div className="space-y-2">
              {commonQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left py-3 px-4 bg-white hover:bg-blue-50 border-purple-100 hover:border-purple-300 text-gray-700 rounded-xl"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <ChatMessage
            content={message.content}
            role={message.role}
            timestamp={message.timestamp}
          />
        </motion.div>
      ))}
      
      <LoadingState isVisible={isLoading} />
      <ErrorMessage error={error} />
      
      <div ref={endOfMessagesRef} />
    </div>
  );
}
