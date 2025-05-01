
import React, { useState } from "react";
import { ConversationSidebar } from "./medical-chat/ConversationSidebar";
import { ChatHeader } from "./medical-chat/ChatHeader";
import { MessageList } from "./medical-chat/MessageList";
import { MedicalDisclaimer } from "./medical-chat/MedicalDisclaimer";
import { ChatInput } from "./medical-chat/ChatInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useChatActions } from "@/hooks/useChatActions";
import { motion } from "framer-motion";

export default function MedicalChat() {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    error,
    setError,
    activeConversation,
    setActiveConversation,
    conversations,
    setConversations,
    saveChatToHistory,
    deleteConversation,
    startNewConversation,
  } = useChatHistory();

  const {
    input,
    setInput,
    handleSendMessage,
  } = useChatActions({
    messages,
    setMessages,
    setIsLoading,
    setError,
    saveChatToHistory,
    activeConversation,
    setActiveConversation,
    setConversations,
  });
  
  const [sidebarVisible, setSidebarVisible] = useState(false); // Default to hidden
  
  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  return (
    <div className="flex flex-col md:flex-row h-full gap-5">
      {/* Decorative elements */}
      <motion.div 
        className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200 rounded-full opacity-10 blur-3xl pointer-events-none"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-10 blur-3xl pointer-events-none"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, -10, 0] 
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      {/* Sidebar with conversations - Initially hidden */}
      {sidebarVisible && (
        <ConversationSidebar
          activeConversation={activeConversation}
          conversations={conversations}
          startNewConversation={startNewConversation}
          setActiveConversation={setActiveConversation}
          deleteConversation={deleteConversation}
          isVisible={sidebarVisible}
          toggleSidebar={toggleSidebar}
        />
      )}
      
      {/* Main chat area */}
      <div className={`flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-300 ${sidebarVisible ? 'md:ml-0' : 'ml-0'}`}>
        <ChatHeader 
          startNewConversation={startNewConversation} 
          toggleSidebar={toggleSidebar} 
          sidebarVisible={sidebarVisible}
        />
        
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          error={error}
          setInput={setInput}
        />
        
        <MedicalDisclaimer />
        
        <ChatInput 
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
