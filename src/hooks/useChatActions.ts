
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Message } from "./useChatHistory";

export function useChatActions({
  messages,
  setMessages,
  setIsLoading,
  setError,
  saveChatToHistory,
  activeConversation,
  setActiveConversation,
  setConversations,
}) {
  const [input, setInput] = useState("");
  const { toast: uiToast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: crypto.randomUUID(),
      content: input,
      role: "user" as const,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await supabase.functions.invoke("medical-assistant", {
        body: { query: input },
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to get response");
      }
      
      const data = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const aiMessage = {
        id: crypto.randomUUID(),
        content: data.answer,
        role: "assistant" as const,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Save chat to history and get the id
      const chatId = await saveChatToHistory(userMessage.content, aiMessage.content);
      
      // Update conversation list if this is a new convo
      if (activeConversation === "new" && chatId) {
        const title = input.length > 30 ? input.substring(0, 30) + "..." : input;
        const newConvo = {
          id: chatId,
          title,
          date: new Date(),
        };
        
        setConversations(prev => [newConvo, ...prev]);
        setActiveConversation(chatId);
        
        // Show toast notification
        toast.success("Conversation saved");
      }
      
    } catch (err) {
      console.error("Error getting AI response:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      uiToast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to get response from MEDIA",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    input,
    setInput,
    handleSendMessage,
  };
}
