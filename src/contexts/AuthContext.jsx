import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
        else {
          setProfile(null);
          setProgram(null);
          setSessions([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Fetch pathologies too
      const { data: pathologies } = await supabase
        .from('user_pathologies')
        .select('*')
        .eq('user_id', userId);

      const { data: conditions } = await supabase
        .from('user_conditions')
        .select('*')
        .eq('user_id', userId);

      setProfile(data ? { ...data, pathologies, conditions } : null);

      // Auto-load program if onboarding is complete
      if (data?.onboarding_complete) {
        await loadProgram(userId);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadProgram(userId) {
    try {
      const uid = userId || user?.id;
      if (!uid) return;
      const { data: prog } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', uid)
        .eq('actif', true)
        .maybeSingle();

      if (!prog) {
        setProgram(null);
        setSessions([]);
        return;
      }
      setProgram(prog);

      const { data: sess } = await supabase
        .from('sessions')
        .select('*, session_exercises(*, exercises(*))')
        .eq('program_id', prog.id)
        .order('jour_semaine');

      setSessions(sess || []);
    } catch (err) {
      console.error('Error loading program:', err);
    }
  }

  async function updateProfile(updates) {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(prev => ({ ...prev, ...data }));
    return data;
  }

  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setProgram(null);
    setSessions([]);
  }

  const value = {
    user,
    profile,
    loading,
    program,
    sessions,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id),
    refreshProgram: () => loadProgram(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
