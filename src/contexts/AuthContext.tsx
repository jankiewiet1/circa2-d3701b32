
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserWithProfile } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any, user: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch session and setup auth state change listener
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session) {
          setSession(session);
          
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile: profile || undefined,
          });
        }
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession && currentSession.user) {
        // Fetch profile on auth changes
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile during auth change:', profileError);
        }
        
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          profile: profile || undefined,
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error, user: null };
      }
      
      if (data.user) {
        // Create a profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            first_name: firstName,
            last_name: lastName,
          });
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast({
            title: "Profile Creation Failed",
            description: "Your account was created but we couldn't set up your profile",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please check your email for verification.",
      });
      
      return { error: null, user: data.user };
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error, user: null };
    }
  };
  
  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };
  
  // Update user profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);
      
      if (error) {
        toast({
          title: "Profile Update Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Refresh user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setUser({
        ...user,
        profile: profile || undefined,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Profile Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };
  
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
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
