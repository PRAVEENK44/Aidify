
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/hooks/useChatHistory";
import { MessageSquarePlus, Trash2, ChevronRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationSidebarProps {
  activeConversation: string | null;
  conversations: Conversation[];
  startNewConversation: () => void;
  setActiveConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  isVisible?: boolean;
  toggleSidebar?: () => void;
}

export function ConversationSidebar({
  activeConversation,
  conversations,
  startNewConversation,
  setActiveConversation,
  deleteConversation,
  isVisible = true,
  toggleSidebar,
}: ConversationSidebarProps) {
  return (
    <div className={`${isVisible ? 'block' : 'hidden md:block'} w-full md:w-80 bg-gray-50 border-r border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full transition-all duration-300`}>
      <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-white animate-pulse" />
          <h2 className="text-white font-medium">Conversations</h2>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={startNewConversation}
            className="text-white hover:bg-white/20"
            title="New conversation"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
          {toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <AnimatePresence>
          {conversations.length > 0 ? (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-all duration-200 hover:bg-gray-200 
                    ${activeConversation === conversation.id ? 'bg-purple-100 border-l-4 border-purple-500' : 'bg-white border border-gray-100'}
                  `}
                  onClick={() => setActiveConversation(conversation.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="truncate flex-1">
                    <p className="font-medium truncate">
                      {conversation.title || "New Conversation"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(conversation.date).toLocaleDateString()} · {conversation.messages?.length || 0} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-8 text-gray-500"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-50 rounded-full">
                  <Heart className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">
                Start a new chat to begin your health journey
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <Button
          variant="outline"
          className="w-full bg-white hover:bg-purple-50 border-purple-200 text-purple-600 transition-all duration-300 hover:shadow-md group"
          onClick={startNewConversation}
        >
          <MessageSquarePlus className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          New Conversation
        </Button>
      </div>
    </div>
  );
}
