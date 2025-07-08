
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Try to fetch user profile with retry mechanism
          let retries = 3;
          let profile = null;
          
          while (retries > 0 && !profile) {
            try {
              console.log(`Attempting to fetch profile, retries left: ${retries}`);
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                if (error.code === 'PGRST116') {
                  console.log('Profile not found, will retry...');
                  retries--;
                  if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                  }
                } else {
                  console.error('Error fetching profile:', error);
                  break;
                }
              } else if (profileData) {
                profile = profileData;
                console.log('Profile fetched successfully:', profile);
                break;
              }
            } catch (err) {
              console.error('Error fetching profile:', err);
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (profile) {
            // Safely cast the role to the expected type
            const userProfile: Profile = {
              ...profile,
              role: (profile.role as 'admin' | 'cs_support' | 'advertiser') || 'cs_support'
            };
            console.log('Setting user profile with role:', userProfile.role);
            setUser(userProfile);
          } else {
            console.log('Could not fetch profile after retries');
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Initial session found:', session.user?.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
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
