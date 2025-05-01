import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Define ProfileType interface to include is_admin
interface ProfileType {
  avatar_url: string;
  created_at: string;
  full_name: string;
  id: string;
  updated_at: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  getUserProfile: () => Promise<ProfileType | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function getInitialSession() {
      setIsLoading(true);
      
      // Check for active session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user || null);
      
      // Load admin status if user is logged in
      if (session?.user) {
        const profile = await getUserProfileInternal(session.user.id);
        setIsAdmin(profile?.is_admin || false);
      }
      
      setIsLoading(false);
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            const profile = await getUserProfileInternal(session.user.id);
            setIsAdmin(profile?.is_admin || false);
          } else {
            setIsAdmin(false);
          }
        }
      );
      
      return () => subscription.unsubscribe();
    }
    
    getInitialSession();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Internal function to get user profile to avoid circular reference
  const getUserProfileInternal = async (userId: string): Promise<ProfileType | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }
      
      return data as ProfileType;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  const getUserProfile = async () => {
    if (!user) return null;
    return getUserProfileInternal(user.id);
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signOut,
    getUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
