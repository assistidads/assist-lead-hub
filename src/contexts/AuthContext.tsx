import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('AuthProvider: Initial session:', currentSession?.user?.id || 'none');
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (profileData) {
            setUser({
              ...profileData,
              role: (profileData.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider: Error getting initial session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthProvider: Auth state changed:', event, newSession?.user?.id || 'none');
        
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          setLoading(true);
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
            
            if (profileData) {
              setUser({
                ...profileData,
                role: (profileData.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
              });
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error('AuthProvider: Error fetching user profile:', error);
            setUser(null);
          } finally {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT' || !newSession) {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          // Keep existing user data on token refresh, just update session
          console.log('AuthProvider: Token refreshed');
        }
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      console.log('AuthProvider: Cleaning up');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const logout = async () => {
    console.log('AuthProvider: Logging out');
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('AuthProvider: Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
