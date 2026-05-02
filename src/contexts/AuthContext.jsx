import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

function adjustColor(hex, amount) {
  if (!hex) return hex;
  return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export function applyThemeVariables(colors) {
  if (!colors) return;
  
  // 1. primary_color devient la couleur d'Arrière-plan (Background)
  if (colors.primary_color) {
    document.documentElement.style.setProperty('--user-bg', colors.primary_color);
    document.documentElement.style.setProperty('--user-bg-lowest', adjustColor(colors.primary_color, -10));
    document.documentElement.style.setProperty('--user-bg-low', adjustColor(colors.primary_color, 5));
    document.documentElement.style.setProperty('--user-bg-container', adjustColor(colors.primary_color, 12));
    document.documentElement.style.setProperty('--user-bg-high', adjustColor(colors.primary_color, 24));
  }
  
  // 2. secondary_color devient la couleur du Texte (Text)
  if (colors.secondary_color) {
    document.documentElement.style.setProperty('--user-text', colors.secondary_color);
    document.documentElement.style.setProperty('--user-text-dim', adjustColor(colors.secondary_color, -60));
  }
  
  // 3. accent_color devient l'Accentuation principale (Néons, Boutons, etc.)
  if (colors.accent_color) {
    document.documentElement.style.setProperty('--user-accent', colors.accent_color);
    document.documentElement.style.setProperty('--user-accent-rgb', hexToRgb(colors.accent_color));
    document.documentElement.style.setProperty('--user-accent-dim', adjustColor(colors.accent_color, -40));
  }
}

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // 1. Gérer UNIQUEMENT la session utilisateur (Auth)
  useEffect(() => {
    let isMounted = true;

    // Récupérer la session existante au chargement
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
      } else {
        setUser(session?.user ?? null);
      }
      setInitialLoadDone(true);
    }).catch(err => {
      console.error('GetSession crash:', err);
      if (isMounted) {
        setLoading(false);
        setInitialLoadDone(true);
      }
    });

    // Écouter les changements (login, logout, tab switch) sans RIEN bloquer
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      console.log('[Auth] Event:', event);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        setProfile(null);
        setProgram(null);
        setSessions([]);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Gérer le chargement des données (Profil + Programme)
  useEffect(() => {
    if (!initialLoadDone) return;
    
    if (user && !profile) {
      // Si on a un user mais pas encore de profil, on le charge
      setLoading(true);
      
      const failsafeTimer = setTimeout(() => {
        setLoading(false);
      }, 5000);

      fetchProfile(user.id).then(() => {
        clearTimeout(failsafeTimer);
      }).catch(() => {
        clearTimeout(failsafeTimer);
        setLoading(false);
      });
    } else if (user && profile) {
      // S'il est chargé, on arrête de bloquer
      setLoading(false);
    } else if (!user) {
      // S'il n'y a pas d'utilisateur, pas besoin de charger
      setLoading(false);
    }
  }, [user, profile, initialLoadDone]);

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

      // Appliquer les couleurs personnalisées au chargement
      if (data) {
        applyThemeVariables({
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color
        });
      }

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
    
    // Appliquer les couleurs en live si elles sont modifiées
    applyThemeVariables(updates);

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
