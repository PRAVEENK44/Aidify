
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export type Conversation = {
  id: string;
  title: string;
  date: Date;
  messages?: Message[]; // Added optional messages array
};

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string>("new");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        // Load chat history for this user
        loadChatHistory();
      } else {
        // Generate a random ID for anonymous users
        setUserId(crypto.randomUUID());
      }
    };

    fetchUser();
  }, []);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: 
            "👋 Hello, I'm Aidie, your AI health assistant. I can help with medical questions, injury assessments, and healthcare guidance. Please describe your symptoms or medical concern in detail.\n\n" +
            "**How can I assist you today?**",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const loadChatHistory = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading chat history:", error);
        return;
      }

      if (data && data.length > 0) {
        // Process the chat history into conversations
        const chatMessages: Message[] = [];
        const uniqueConversations = new Map();

        data.forEach((chat) => {
          // Create user message
          chatMessages.push({
            id: `user-${chat.id}`,
            content: chat.message,
            role: "user",
            timestamp: new Date(chat.timestamp),
          });

          // Create AI response message
          chatMessages.push({
            id: `ai-${chat.id}`,
            content: chat.response,
            role: "assistant",
            timestamp: new Date(chat.timestamp),
          });

          // Extract conversation title from first message
          const title = chat.message.length > 30 
            ? chat.message.substring(0, 30) + "..." 
            : chat.message;
          
          // Use the chat.id as a conversation ID 
          // Convert it to a string to match activeConversation type
          const convoId = String(chat.id);
          
          if (!uniqueConversations.has(convoId)) {
            uniqueConversations.set(convoId, {
              id: convoId,
              title,
              date: new Date(chat.timestamp),
            });
          }
        });

        // Convert the map to an array and sort by date
        const convoArray = Array.from(uniqueConversations.values())
          .sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setConversations(convoArray);
        
        // Set only most recent conversation's messages if we have any
        if (convoArray.length > 0) {
          setActiveConversation(convoArray[0].id);
          
          // For simplicity, just show the welcome message and latest conversation
          // In a real app, you'd filter messages by conversation ID
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: 
                "👋 Hello, I'm MEDIA, your medical assistant. I can help with medical questions, injury assessments, and healthcare guidance. Please describe your symptoms or medical concern in detail.\n\n" +
                "**How can I assist you today?**",
              timestamp: new Date(),
            },
            ...chatMessages.slice(0, 10).reverse(),
          ]);
        }
      }
    } catch (err) {
      console.error("Error in loadChatHistory:", err);
    }
  };

  const saveChatToHistory = async (userMessage: string, aiResponse: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.from("chat_history").insert({
        user_id: userId,
        message: userMessage,
        response: aiResponse,
        timestamp: new Date().toISOString(),
      }).select();

      if (error) {
        console.error("Error saving chat to history:", error);
        return;
      }
      
      // Return the string ID of the newly created chat record
      return data?.[0]?.id ? String(data[0].id) : null;
    } catch (err) {
      console.error("Error in saveChatToHistory:", err);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!userId) return;

    try {
      // Convert the string id to a number for the database query
      const numericId = parseInt(id, 10);
      
      if (isNaN(numericId)) {
        throw new Error("Invalid conversation ID");
      }
      
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("id", numericId);

      if (error) {
        console.error("Error deleting conversation:", error);
        throw new Error("Failed to delete conversation");
      }

      // Update conversations list
      setConversations(prev => prev.filter(convo => convo.id !== id));
      
      // If active conversation was deleted, start a new one
      if (activeConversation === id) {
        startNewConversation();
      }
    } catch (err) {
      console.error("Error in deleteConversation:", err);
      throw err;
    }
  };

  const startNewConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: 
          "👋 Hello, I'm Aidie, your AI health assistant. I can help with medical questions, injury assessments, and healthcare guidance. Please describe your symptoms or medical concern in detail.\n\n" +
          "**How can I assist you today?**",
        timestamp: new Date(),
      },
    ]);
    setActiveConversation("new");
  };

  return {
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
    userId,
    saveChatToHistory,
    deleteConversation,
    startNewConversation,
  };
}
