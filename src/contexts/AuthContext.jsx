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
    let isMounted = true;
    
    // Absolute failsafe: force loading to false after 5 seconds no matter what
    const failsafeTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        clearTimeout(failsafeTimer);
      } else {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).then(() => {
            if (isMounted) clearTimeout(failsafeTimer);
          });
        } else {
          setLoading(false);
          clearTimeout(failsafeTimer);
        }
      }
    }).catch(err => {
      console.error('GetSession crash:', err);
      if (isMounted) setLoading(false);
      clearTimeout(failsafeTimer);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('[Auth] onAuthStateChange event:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // On ne déclenche un rechargement complet de la base de données 
          // QUE lors d'une vraie connexion.
          // Quand l'utilisateur change d'onglet, Supabase émet un "TOKEN_REFRESHED" ou "USER_UPDATED",
          // il ne faut surtout pas geler l'application avec un écran de chargement à ce moment-là !
          if (event === 'SIGNED_IN') {
            setLoading(true);
            await fetchProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProgram(null);
          setSessions([]);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(failsafeTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId) {
    try {
      console.log('[Auth] Fetching profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      console.log('[Auth] Profiles query OK', data);
      
      console.log('[Auth] Fetching user_pathologies...');
      const { data: pathologies } = await supabase
        .from('user_pathologies')
        .select('*')
        .eq('user_id', userId);
      console.log('[Auth] Pathologies query OK');

      console.log('[Auth] Fetching user_conditions...');
      const { data: conditions } = await supabase
        .from('user_conditions')
        .select('*')
        .eq('user_id', userId);
      console.log('[Auth] Conditions query OK');

      setProfile(data ? { ...data, pathologies, conditions } : null);

      if (data?.onboarding_complete) {
        console.log('[Auth] Onboarding complete, loading program...');
        await loadProgram(userId);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      console.log('[Auth] fetchProfile finished.');
      setLoading(false);
    }
  }

  async function loadProgram(userId) {
    try {
      const uid = userId || user?.id;
      if (!uid) return;
      console.log('[Auth] Fetching program for:', uid);
      const { data: prog } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', uid)
        .eq('actif', true)
        .maybeSingle();

      console.log('[Auth] Programs query OK', prog);
      if (!prog) {
        setProgram(null);
        setSessions([]);
        return;
      }
      setProgram(prog);

      console.log('[Auth] Fetching sessions & exercises...');
      const { data: sess } = await supabase
        .from('sessions')
        .select('*, session_exercises(*, exercises(*))')
        .eq('program_id', prog.id)
        .order('jour_semaine');

      console.log('[Auth] Sessions query OK', sess?.length);
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
