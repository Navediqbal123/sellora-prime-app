import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserRole } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type RoleRow = { role: UserRole };

const pickHighestRole = (rows: RoleRow[]): UserRole => {
  const roles = new Set(rows.map((r) => r.role));
  if (roles.has('admin')) return 'admin';
  if (roles.has('shopkeeper')) return 'shopkeeper';
  return 'user';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      // 1) Authoritative roles table
      const { data: roleRows, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!roleError && roleRows && roleRows.length > 0) {
        setRole(pickHighestRole(roleRows as RoleRow[]));
        return;
      }

      // 2) Backwards-compat for existing sellers (role derived from sellers table)
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!sellerError && sellerData) {
        setRole('shopkeeper');
        return;
      }

      setRole('user');
    } catch {
      setRole('user');
    }
  };

  const refreshRole = async () => {
    if (!user?.id) return;
    await fetchUserRole(user.id);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setRole('user');
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    // Create profile if signup successful
    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName || '',
        email,
        updated_at: new Date().toISOString(),
      });

      // Ensure every user has a baseline role row (safe to ignore if table not present)
      await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'user' })
        .then(() => undefined)
        .catch(() => undefined);
    }

    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
