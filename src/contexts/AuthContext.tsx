
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
    let timeoutId: NodeJS.Timeout;
    
    console.log('AuthProvider: Initializing auth');
    
    // Set timeout to prevent infinite loading (fallback mechanism)
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('AuthProvider: Timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    const handleAuthChange = async (event: string, newSession: Session | null) => {
      if (!mounted) return;
      
      console.log('AuthProvider: Auth state changed:', event, 'Session exists:', !!newSession);
      
      try {
        setSession(newSession);
        
        if (newSession?.user) {
          console.log('AuthProvider: Fetching profile for user:', newSession.user.id);
          
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          if (error) {
            console.error('AuthProvider: Profile fetch error:', error);
            // If profile doesn't exist, create a basic user object from session
            if (mounted) {
              setUser({
                id: newSession.user.id,
                email: newSession.user.email || '',
                full_name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0] || 'User',
                role: 'cs_support' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
          } else if (profileData && mounted) {
            console.log('AuthProvider: Profile loaded successfully');
            setUser({
              ...profileData,
              role: (profileData.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
            });
          }
        } else {
          console.log('AuthProvider: No session, clearing user');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider: Error in auth change handler:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        console.log('AuthProvider: Getting initial session');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
          if (mounted) {
            setLoading(false);
            clearTimeout(timeoutId);
          }
          return;
        }
        
        console.log('AuthProvider: Initial session check complete, session exists:', !!currentSession);
        
        // Handle the initial session
        await handleAuthChange('INITIAL', currentSession);
        
      } catch (error) {
        console.error('AuthProvider: Error in initialize auth:', error);
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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
