import React, { useState, useEffect } from "react";
import { MessageSquare, X, Phone, Bot, Heart, Settings, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import MedicalChat from "@/components/MedicalChat";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { initiateEmergencyCall } from '@/utils/deviceUtils';

export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [showSimpleChat, setShowSimpleChat] = useState(false);

  // Reset first open state after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isChatOpen) {
      timer = setTimeout(() => {
        setIsFirstOpen(true);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsFirstOpen(false);
      toast.info("Chat with Aidie is now open", {
        description: "Ask about medical concerns or first aid instructions",
        duration: 3000,
      });
    }
  };

  const callEmergency = () => {
    initiateEmergencyCall("108");
    toast.error("Calling emergency services...", {
      description: "This is a simulation. In a real emergency, call your local emergency number immediately.",
      duration: 5000,
    });
  };

  const handleSimpleChatToggle = () => {
    setShowSimpleChat(!showSimpleChat);
  };

  const suggestedQuestions = [
    "Which injuries require immediate medical attention?",
    "How to save first aid instructions for offline use?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {/* Removed Medical Assistant Button */}
        
        {/* Chat Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={toggleChat}
            className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-transform hover:scale-105"
            aria-label={isChatOpen ? "Close chat" : "Open chat"}
          >
            {isChatOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Simple Chat Window (similar to the screenshot) */}
      <AnimatePresence>
        {showSimpleChat && (
          <motion.div 
            className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] md:w-[450px] h-auto bg-white rounded-xl shadow-2xl border z-40 overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">Chat AI</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 p-0">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 p-0" onClick={() => setShowSimpleChat(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Chat Content */}
              <div className="p-4">
                <p className="text-gray-800 mb-6">
                  Hello! Is there any question I can help you with?
                </p>
                
                {/* Suggested Questions */}
                <div className="flex flex-col gap-2 mb-6">
                  {suggestedQuestions.map((question, index) => (
                    <div 
                      key={index}
                      className="bg-blue-50 text-blue-600 p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {question}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter your health question here"
                    className="w-full p-3 pr-20 border rounded-full bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Button 
                    className="absolute right-1 top-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 text-sm"
                  >
                    Ask AI
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Chat Window with Framer Motion */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] md:w-[450px] h-[600px] bg-white rounded-xl shadow-2xl border z-40 overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 animate-pulse" />
                  <h3 className="font-bold text-lg">Aidie Assistant</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSimpleChatToggle} className="text-white hover:bg-white/20 h-8 p-0 text-xs">
                    {showSimpleChat ? "Full Chat" : "Simple Chat"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 p-0" onClick={toggleChat}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <MedicalChat />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Welcome tooltip for first time users */}
      <AnimatePresence>
        {!isChatOpen && isFirstOpen && (
          <motion.div
            className="fixed bottom-24 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex items-start gap-3">
              <Heart className="h-8 w-8 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1">Need health guidance?</h4>
                <p className="text-xs text-gray-600">Chat with Aidie, your personal AI health assistant! Click to start.</p>
              </div>
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
