import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, organizationName: string) => Promise<void>;
  signOut: () => Promise<void>;
  currentOrganization: any | null;
  setCurrentOrganization: (org: any) => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<any | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user && !currentOrganization) {
          // First, ensure user exists in users table
          await ensureUserExists(session.user);
          
          // Load user's organizations
          const { data: userOrgs } = await supabase
            .from('user_organizations')
            .select(`
              *,
              organizations (*)
            `)
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single();

          if (userOrgs) {
            setCurrentOrganization(userOrgs.organizations);
          }
        }

        if (!session) {
          setCurrentOrganization(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [currentOrganization]);

  const ensureUserExists = async (user: User) => {
    try {
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // Create user record
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
          });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating user record:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Successfully signed in!');
  };

  const signUp = async (email: string, password: string, organizationName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    if (data.user) {
      // Ensure user record exists
      await ensureUserExists(data.user);

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          owner_user_id: data.user.id,
          timezone: 'America/New_York',
          currency_code: 'USD',
        })
        .select()
        .single();

      if (orgError) {
        toast.error('Failed to create organization');
        throw orgError;
      }

      // Create user-organization relationship
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: data.user.id,
          organization_id: org.id,
          role: 'owner',
          status: 'active',
        });

      if (userOrgError) {
        toast.error('Failed to set up user organization');
        throw userOrgError;
      }

      toast.success('Account created successfully!');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Successfully signed out!');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    currentOrganization,
    setCurrentOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};