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
    let isMounted = true;
    let isInitialized = false;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          console.log('Initial session found:', session.user.id);
          setSession(session);
          
          const profile = await fetchUserProfile(session.user.id);
          if (isMounted) {
            setUser(profile);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          isInitialized = true;
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (isMounted) {
          setLoading(false);
          isInitialized = true;
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        // Prevent processing events before initial session is loaded
        if (!isInitialized && event !== 'INITIAL_SESSION') {
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            setLoading(true);
            const profile = await fetchUserProfile(session.user.id);
            if (isMounted) {
              setUser(profile);
              setLoading(false);
            }
          } else if (event === 'TOKEN_REFRESHED') {
            // For token refresh, keep existing user data
            console.log('Token refreshed, keeping existing user data');
          } else if (!user) {
            // Only fetch profile if we don't have user data
            const profile = await fetchUserProfile(session.user.id);
            if (isMounted) {
              setUser(profile);
            }
          }
        } else {
          if (isMounted) {
            setUser(null);
            if (event === 'SIGNED_OUT') {
              setLoading(false);
            }
          }
        }
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove all dependencies to prevent re-runs

  const logout = async () => {
    try {
      console.log('Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
