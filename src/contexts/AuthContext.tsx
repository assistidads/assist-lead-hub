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
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      if (profileData) {
        const userProfile: Profile = {
          ...profileData,
          role: (profileData.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
        };
        console.log('Profile fetched successfully:', userProfile);
        return userProfile;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialLoad(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('Session found, fetching user profile:', session.user.id);
          setSession(session);
          
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser(profile);
          }
        }
        
        if (mounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || initialLoad) return;
        
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching profile');
          setLoading(true);
          setSession(session);
          
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUser(profile);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          if (mounted) {
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed');
          if (mounted) {
            setSession(session);
            // Keep existing user data, don't refetch
          }
        }
      }
    );

    // Initialize auth after setting up listener
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-runs

  const logout = async () => {
    try {
      console.log('Logging out...');
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
