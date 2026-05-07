import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Activity, Flame, Moon, Sun, Camera, Palette, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MORPHOTYPE_LABEL = { ectomorphe: '🏃 Ectomorphe', mesomorphe: '💪 Mésomorphe', endomorphe: '🐻 Endomorphe' };
const OBJECTIF_LABEL = { perte_poids: '🔥 Perte de poids', prise_masse: '💪 Prise de masse', tonification: '✨ Tonification', endurance: '🏃 Endurance', seche: '🔥 Sèche' };
const MODE_LABEL = { salle: '🏋️ Salle', street_workout: '🌳 Street Workout', mixte: '🔄 Mixte' };

const PRESET_THEMES = [
  { name: 'Kinetic Noir', primary: '#00E5FF', secondary: '#7C4DFF', accent: '#FFD700' },
  { name: 'Ocean Blue', primary: '#2979FF', secondary: '#00BCD4', accent: '#64FFDA' },
  { name: 'Forest Green', primary: '#00E676', secondary: '#69F0AE', accent: '#FFD740' },
  { name: 'Sunset Fire', primary: '#FF6B00', secondary: '#FF4081', accent: '#FFD740' },
  { name: 'Royal Purple', primary: '#7C4DFF', secondary: '#E040FB', accent: '#FF4081' },
];

export default function Profile() {
  const { profile, user, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [colors, setColors] = useState({
    primary: profile?.primary_color || '#00E5FF',
    secondary: profile?.secondary_color || '#7C4DFF',
    accent: profile?.accent_color || '#FFD700',
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache buster
      const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await updateProfile({ photo_url: freshUrl });
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors de l\'upload. Vérifie que le bucket "avatars" existe dans Supabase Storage.');
    } finally {
      setUploading(false);
    }
  }

  async function saveColors() {
    try {
      await updateProfile({
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
      });
      // Apply to CSS variables
      document.documentElement.style.setProperty('--user-primary', colors.primary);
      document.documentElement.style.setProperty('--user-secondary', colors.secondary);
      document.documentElement.style.setProperty('--user-accent', colors.accent);
      setShowColors(false);
    } catch (err) {
      console.error(err);
    }
  }

  function applyPreset(preset) {
    setColors({ primary: preset.primary, secondary: preset.secondary, accent: preset.accent });
  }

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const avatarUrl = profile?.photo_url || profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.prenom || 'A'}&background=1a1919&color=00E5FF&bold=true&size=120`;

  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">

        {/* Hero Header with Photo */}
        <motion.div variants={item} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-6)', 
          marginBottom: 'var(--space-10)', 
          flexWrap: 'wrap' 
        }}>
          <div style={{ position: 'relative' }}>
            <img src={avatarUrl} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            <button onClick={() => fileRef.current?.click()} style={{
              position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: '50%',
              background: 'var(--primary)', border: 'none', color: 'var(--on-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            {uploading && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            </div>}
          </div>
          <div>
            <h1 className="display-md" style={{ 
              textTransform: 'uppercase', 
              lineHeight: 0.9, 
              margin: 0, 
              wordBreak: 'break-word',
              fontSize: '2rem'
            }}>
              {profile?.prenom || 'ATHLÈTE'}<br />
              <span style={{ color: 'var(--secondary)' }}>{profile?.nom || 'INCONNU'}</span>
            </h1>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="label-sm" style={{ color: 'var(--secondary)', background: 'var(--surface-container-high)', padding: '2px 10px', borderRadius: 999 }}>
                LEVEL {Math.floor((profile?.xp || 0) / 1000) + 1}
              </span>
              {(profile?.streak_current || 0) > 0 && (
                <span className="label-sm" style={{ color: '#FF6B00', background: 'rgba(255,107,0,0.1)', padding: '2px 10px', borderRadius: 999 }}>
                  🔥 {profile.streak_current}j
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bento Stats Grid */}
        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
          <div style={{ gridColumn: '1 / -1', background: 'var(--surface-container-low)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', right: '-10%', top: '-10%', opacity: 0.05 }}><Activity size={240} /></div>
            <div>
              <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>MÉTABOLISME DE BASE</span>
              <div className="display-md" style={{ marginTop: 'var(--space-2)' }}>{Math.round(profile?.metabolisme_base || 0)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--primary)', fontWeight: 'bold', marginTop: 'var(--space-4)' }}>
              <Flame size={20} /><span className="label-md">KCAL / JOUR</span>
            </div>
          </div>
          {[
            ['POIDS', profile?.poids_kg, 'kg'],
            ['TAILLE', profile?.taille_cm, 'cm'],
            ['IMC', profile?.imc, ''],
            ['SÉANCES', profile?.duree_seance, 'min'],
          ].map(([label, val, unit]) => (
            <div key={label} style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
              <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{label}</span>
              <div className="headline-md" style={{ marginTop: 'var(--space-2)' }}>{val || '--'} {unit && <span style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>{unit}</span>}</div>
            </div>
          ))}
        </motion.div>

        {/* Objective */}
        <motion.div variants={item} style={{ marginBottom: 'var(--space-10)' }}>
          <h2 className="title-lg" style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>OBJECTIF ACTUEL</h2>
          <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', textTransform: 'uppercase' }}>{OBJECTIF_LABEL[profile?.objectif] || 'Non défini'}</h3>
            <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              {profile?.morphotype ? MORPHOTYPE_LABEL[profile.morphotype] : ''} • {profile?.mode_entrainement ? MODE_LABEL[profile.mode_entrainement] : ''}
            </p>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={item} style={{ marginBottom: 'var(--space-10)' }}>
          <h2 className="title-lg" style={{ borderLeft: '4px solid var(--outline)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>PRÉFÉRENCES</h2>

          {/* Theme toggle */}
          <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--primary)' }} /> : <Sun size={20} style={{ color: 'var(--primary)' }} />}
                <span className="body-md" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Thème {theme === 'dark' ? 'Sombre' : 'Clair'}</span>
              </div>
              <button className={`toggle ${theme === 'light' ? 'toggle--active' : ''}`} onClick={toggleTheme} aria-label="Changer de thème">
                <div className="toggle__thumb"></div>
              </button>
            </div>
          </div>

          {/* Color customizer toggle */}
          <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4) var(--space-6)' }}>
            <button onClick={() => setShowColors(!showColors)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: 'var(--on-surface)', cursor: 'pointer', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <Palette size={20} style={{ color: 'var(--primary)' }} />
                <span className="body-md" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Couleurs personnalisées</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[colors.primary, colors.secondary, colors.accent].map((c, i) => (
                  <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: '2px solid var(--surface-container)' }} />
                ))}
              </div>
            </button>
          </div>

          {/* Color picker panel */}
          {showColors && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                {/* Presets */}
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Thèmes prédéfinis</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                  {PRESET_THEMES.map(preset => (
                    <button key={preset.name} onClick={() => applyPreset(preset)} style={{
                      padding: '8px 14px', borderRadius: 999, background: 'var(--surface-container-high)',
                      border: '1px solid rgba(var(--outline-variant), 0.2)', color: 'var(--on-surface)',
                      cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: preset.primary }} />
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Custom inputs visuales */}
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Réglage fin</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  {[
                    ['Arrière-plan', 'primary', colors.primary], 
                    ['Texte', 'secondary', colors.secondary], 
                    ['Accentuation', 'accent', colors.accent]
                  ].map(([label, key, val]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <label className="label-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 8 }}>{label}</label>
                      <div style={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', background: val, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: '3px solid var(--surface-container-high)', overflow: 'hidden' }}>
                        <input type="color" value={val} onChange={e => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ position: 'absolute', top: -10, left: -10, width: 100, height: 100, opacity: 0, cursor: 'pointer' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div style={{ background: '#0e0e0e', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="label-sm" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 12, textAlign: 'center', letterSpacing: '0.1em' }}>APERÇU DU THÈME</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-container)', padding: 12, borderRadius: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flame size={20} style={{ color: '#000' }} />
                      </div>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />
                    </div>
                    <button style={{ width: '100%', background: colors.primary, color: '#000', border: 'none', padding: 12, borderRadius: 8, fontWeight: 'bold' }}>
                      BOUTON PRIMAIRE
                    </button>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <span style={{ color: colors.secondary, fontWeight: 'bold' }}>Texte Secondaire</span>
                      <span style={{ color: colors.accent, fontWeight: 'bold' }}>• Accent</span>
                    </div>
                  </div>
                </div>

                <button onClick={saveColors} style={{
                  width: '100%', background: 'var(--primary)', color: 'var(--on-primary)',
                  border: 'none', padding: '14px', borderRadius: 'var(--radius-xl)', fontWeight: 700,
                  cursor: 'pointer', textTransform: 'uppercase',
                }}>Sauvegarder les couleurs</button>
              </div>
            </motion.div>
          )}

          {/* Admin Access Section */}
          {(() => {
            const userEmail = (user?.email || user?.user_metadata?.email || "").toLowerCase().trim();
            if (userEmail === 'a-bouterfas@outlook.fr') {
              return (
                <motion.div variants={item} style={{ marginBottom: 'var(--space-6)' }}>
                  <h2 className="title-lg" style={{ borderLeft: '4px solid var(--primary)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>Administration</h2>
                  <button 
                    className="btn btn--primary btn--full" 
                    onClick={() => navigate('/admin')}
                    style={{ 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.2)'
                    }}
                  >
                    <ShieldCheck size={18} /> PANEL ADMINISTRATION
                  </button>
                </motion.div>
              );
            }
            return null;
          })()}

          <button className="btn btn--danger btn--full" onClick={handleLogout} disabled={loggingOut} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <LogOut size={18} /> {loggingOut ? 'DÉCONNEXION...' : 'SE DÉCONNECTER'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
