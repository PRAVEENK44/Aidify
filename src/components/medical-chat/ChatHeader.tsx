
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bot, Menu, X, Heart } from "lucide-react";
import { motion } from "framer-motion";

type ChatHeaderProps = {
  startNewConversation: () => void;
  toggleSidebar?: () => void;
  sidebarVisible?: boolean;
};

export function ChatHeader({ startNewConversation, toggleSidebar, sidebarVisible }: ChatHeaderProps) {
  return (
    <div className="p-6 border-b bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white flex justify-between items-center">
      <motion.div 
        className="flex items-center gap-3" 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {toggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:hidden text-white hover:bg-white/20"
          >
            {sidebarVisible ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
        <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Heart className="h-7 w-7" />
          </motion.div>
        </div>
        <div>
          <h2 className="font-bold text-2xl">Aidie</h2>
          <div className="flex items-center gap-2">
            <p className="text-white/80 text-sm">Health Assistant</p>
            <Badge className="bg-green-500 hover:bg-green-600 text-[10px] h-5">Online</Badge>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={startNewConversation}
          title="Start new conversation"
          className="text-white hover:bg-white/20"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          <span>New Chat</span>
        </Button>
      </motion.div>
    </div>
  );
}
