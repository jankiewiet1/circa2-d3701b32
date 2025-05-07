import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserWithProfile } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
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
    console.log("AuthProvider: initializing auth state");
    setLoading(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, "with session:", !!currentSession);
      setSession(currentSession);
      
      if (currentSession && currentSession.user) {
        // Fetch profile on auth changes - using setTimeout to avoid Supabase auth deadlocks
        setTimeout(async () => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile during auth change:', profileError);
          }
          
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            profile: profile || undefined,
          });
          
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    
    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        console.log("Fetching initial session");
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (initialSession) {
          console.log("Initial session found");
          setSession(initialSession);
          
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .maybeSingle();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }
          
          // Make sure we're setting the profile with all required fields,
          // even if some are undefined
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email || '',
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
    
    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe = true) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
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
      console.log("Starting signup process for:", email);

      // Step 1: Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (authError) {
        console.error("Auth signup error:", authError);
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive"
        });
        return { error: authError, user: null };
      }
      
      if (!authData.user) {
        console.error("No user data returned from auth signup");
        return { 
          error: new Error("Failed to create user account"), 
          user: null 
        };
      }

      // Step 2: Create profile with the auth user's ID
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Log the full error for debugging
        console.log("Full profile error:", JSON.stringify(profileError, null, 2));
      }
      
      console.log("User registration completed successfully:", authData.user.id);
      
      toast({
        title: "Welcome to Circa! 🌱",
        description: "Please check your email to confirm your account. After confirming, we'd love to show you around - book a demo with our team!",
        variant: "default",
        duration: 10000, // Show for 10 seconds
        action: (
          <div className="flex gap-2">
            <a
              href="https://calendly.com/your-calendly-link"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Book Demo
            </a>
          </div>
        ),
      });
      
      return { error: null, user: authData.user };
    } catch (error: any) {
      console.error("Unexpected error during registration:", error);
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
        .eq('id', user.id);
      
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
        .eq('id', user.id)
        .maybeSingle();
      
      // Update the user state with the new profile data
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
