
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
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
    let mounted = true;
    
    console.log('AuthProvider: Initializing auth');
    
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log('AuthProvider: Auth state changed:', event);
        
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          console.log('AuthProvider: User signed in, fetching profile');
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
            
            if (error) {
              console.error('AuthProvider: Error fetching profile:', error);
              setUser(null);
            } else if (profileData && mounted) {
              setUser({
                ...profileData,
                role: (profileData.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
              });
            }
          } catch (error) {
            console.error('AuthProvider: Profile fetch error:', error);
            if (mounted) setUser(null);
          }
        } else if (event === 'SIGNED_OUT' || !newSession) {
          console.log('AuthProvider: User signed out');
          if (mounted) setUser(null);
        }
        
        if (mounted) setLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('AuthProvider: Initial session check');
        
        if (currentSession?.user && mounted) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
          
          if (error) {
            console.error('AuthProvider: Initial profile fetch error:', error);
          } else if (profileData) {
            setUser({
              ...profileData,
              role: (profileData.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
            });
          }
          setSession(currentSession);
        }
      } catch (error) {
        console.error('AuthProvider: Initial session error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log('AuthProvider: Logging out');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('AuthProvider: Error signing out:', error);
    }
  };

  const value = {
    user,
    profile: user, // Add profile property that points to user
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
