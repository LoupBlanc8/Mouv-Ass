import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Activity, Flame, Moon, Sun, Target } from 'lucide-react';

const MORPHOTYPE_LABEL = { ectomorphe: '🏃 Ectomorphe', mesomorphe: '💪 Mésomorphe', endomorphe: '🐻 Endomorphe' };
const OBJECTIF_LABEL = { perte_poids: '🔥 Perte de poids', prise_masse: '💪 Prise de masse', tonification: '✨ Tonification', endurance: '🏃 Endurance' };
const MODE_LABEL = { salle: '🏋️ Salle', street_workout: '🌳 Street Workout', mixte: '🔄 Mixte' };

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  }

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">
        
        {/* Editorial Hero Header */}
        <motion.div variants={item} style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-6)', marginBottom: 'var(--space-10)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          <h1 className="display-md" style={{ textTransform: 'uppercase', lineHeight: 1, margin: 0, wordBreak: 'break-word' }}>
            {profile?.prenom || 'ATHLÈTE'}<br />
            <span style={{ color: 'var(--secondary)' }}>{profile?.nom || 'INCONNU'}</span>
          </h1>
          <div style={{ marginBottom: '8px', background: 'var(--surface-container-high)', padding: 'var(--space-1) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-sm" style={{ color: 'var(--secondary)' }}>
              ELITE LEVEL {Math.floor((profile?.xp || 0) / 1000) + 1}
            </span>
          </div>
        </motion.div>

        {/* Bento Stats Grid */}
        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
          {/* Main Metric: Métabolisme */}
          <div style={{ gridColumn: '1 / -1', background: 'var(--surface-container-low)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', right: '-10%', top: '-10%', opacity: 0.05 }}>
              <Activity size={240} />
            </div>
            <div>
              <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>MÉTABOLISME DE BASE</span>
              <div className="display-md" style={{ marginTop: 'var(--space-2)' }}>{Math.round(profile?.metabolisme_base || 0)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--primary)', fontWeight: 'bold', marginTop: 'var(--space-4)' }}>
              <Flame size={20} />
              <span className="label-md">KCAL / JOUR</span>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>POIDS</span>
            <div className="headline-md" style={{ marginTop: 'var(--space-2)' }}>{profile?.poids_kg || '--'} <span style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>kg</span></div>
          </div>
          <div style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>TAILLE</span>
            <div className="headline-md" style={{ marginTop: 'var(--space-2)' }}>{profile?.taille_cm || '--'} <span style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>cm</span></div>
          </div>
          <div style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>IMC</span>
            <div className="headline-md" style={{ marginTop: 'var(--space-2)' }}>{profile?.imc || '--'}</div>
          </div>
          <div style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>SÉANCES</span>
            <div className="headline-md" style={{ marginTop: 'var(--space-2)' }}>{profile?.duree_seance || '--'} <span style={{ fontSize: '1rem', color: 'var(--on-surface-variant)' }}>min</span></div>
          </div>
        </motion.div>

        {/* Current Objectives & Pathologies */}
        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
          {/* Objective */}
          <div>
            <h2 className="title-lg" style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>OBJECTIF ACTUEL</h2>
            <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', textTransform: 'uppercase' }}>{OBJECTIF_LABEL[profile?.objectif] || 'Non défini'}</h3>
                  <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                    {profile?.morphotype ? MORPHOTYPE_LABEL[profile.morphotype] : ''} • {profile?.mode_entrainement ? MODE_LABEL[profile.mode_entrainement] : ''}
                  </p>
                </div>
                <span className="label-sm" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>EN COURS</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__fill animate-pulse-glow" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          {/* Pathologies */}
          {profile?.pathologies?.length > 0 && (
            <div>
              <h2 className="title-lg" style={{ borderLeft: '4px solid var(--error)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>ATTENTION SANTÉ</h2>
              <div style={{ background: 'var(--surface-container-highest)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {profile.pathologies.map(p => (
                     <span key={p.id} className="chip chip--sm" style={{ color: 'var(--error)' }}>⚠️ {p.zone.replace('_', ' ').toUpperCase()}</span>
                  ))}
                </div>
                <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-4)' }}>
                  Ton programme est automatiquement adapté pour protéger ces articulations lors de tes séances.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Preferences */}
        <motion.div variants={item} style={{ marginBottom: 'var(--space-10)' }}>
          <h2 className="title-lg" style={{ borderLeft: '4px solid var(--outline)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>PRÉFÉRENCES</h2>
          
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4) var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {theme === 'dark' ? <Moon size={20} style={{ color: 'var(--primary)' }} /> : <Sun size={20} style={{ color: 'var(--primary)' }} />}
                <span className="body-md" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Thème {theme === 'dark' ? 'Sombre' : 'Clair'}</span>
              </div>
              <button 
                className={`toggle ${theme === 'light' ? 'toggle--active' : ''}`} 
                onClick={toggleTheme}
                aria-label="Changer de thème"
              >
                <div className="toggle__thumb"></div>
              </button>
            </div>
          </div>

          <button className="btn btn--danger btn--full" onClick={handleLogout} disabled={loggingOut} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <LogOut size={18} /> {loggingOut ? 'DÉCONNEXION...' : 'SE DÉCONNECTER'}
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
