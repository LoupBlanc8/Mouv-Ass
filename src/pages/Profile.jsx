import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, ChevronRight, User as UserIcon, Scale, Ruler, Target, Activity, Calendar, Clock } from 'lucide-react';

const MORPHOTYPE_LABEL = { ectomorphe: '🏃 Ectomorphe', mesomorphe: '💪 Mésomorphe', endomorphe: '🐻 Endomorphe' };
const OBJECTIF_LABEL = { perte_poids: '🔥 Perte de poids', prise_masse: '💪 Prise de masse', tonification: '✨ Tonification', endurance: '🏃 Endurance' };
const MODE_LABEL = { salle: '🏋️ Salle', street_workout: '🌳 Street Workout', mixte: '🔄 Mixte' };
const NIVEAU_LABEL = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function Profile() {
  const { profile, user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  const infoRows = [
    { icon: Scale, label: 'Poids', value: profile?.poids_kg ? `${profile.poids_kg} kg` : '—' },
    { icon: Ruler, label: 'Taille', value: profile?.taille_cm ? `${profile.taille_cm} cm` : '—' },
    { icon: Activity, label: 'IMC', value: profile?.imc || '—' },
    { icon: Target, label: 'Objectif', value: OBJECTIF_LABEL[profile?.objectif] || '—' },
    { icon: Calendar, label: 'Jours', value: (profile?.jours_semaine || []).map(j => JOURS[j]).join(', ') || '—' },
    { icon: Clock, label: 'Durée séance', value: profile?.duree_seance ? `${profile.duree_seance} min` : '—' },
  ];

  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="page-header">
          <h1 className="headline-md">Profil</h1>
        </motion.div>

        {/* Avatar + Name */}
        <motion.div variants={item} className="card card--elevated" style={{ textAlign: 'center', marginBottom: 'var(--space-6)', padding: 'var(--space-8) var(--space-6)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto var(--space-4)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary-dim))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(129,236,255,0.15)'
          }}>
            <UserIcon size={36} color="var(--on-primary)" />
          </div>
          <h2 className="title-lg">{profile?.prenom || ''} {profile?.nom || ''}</h2>
          <p className="body-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>{user?.email}</p>
          <div className="flex gap-2 justify-center" style={{ marginTop: 'var(--space-4)' }}>
            {profile?.morphotype && <span className="chip chip--selected">{MORPHOTYPE_LABEL[profile.morphotype]}</span>}
            {profile?.niveau && <span className="chip chip--sm">{NIVEAU_LABEL[profile.niveau]}</span>}
            {profile?.mode_entrainement && <span className="chip chip--sm">{MODE_LABEL[profile.mode_entrainement]}</span>}
          </div>
        </motion.div>

        {/* Info Rows */}
        <motion.div variants={item}>
          <p className="section-label">Informations</p>
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 0, overflow: 'hidden' }}>
            {infoRows.map(({ icon: Icon, label, value }, i) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', padding: 'var(--space-4) var(--space-5)',
                background: i % 2 === 0 ? 'var(--surface-container)' : 'var(--surface-container-low)',
              }}>
                <Icon size={18} style={{ color: 'var(--primary)', marginRight: 'var(--space-4)', flexShrink: 0 }} />
                <span className="body-md" style={{ flex: 1 }}>{label}</span>
                <span className="body-md" style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Métabolisme */}
        {profile?.metabolisme_base && (
          <motion.div variants={item}>
            <p className="section-label">Métabolisme</p>
            <div className="card card--glow-secondary" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="label-sm text-muted">Métabolisme de base</span>
                  <div className="headline-md text-secondary">{Math.round(profile.metabolisme_base)} <span className="body-sm">kcal/j</span></div>
                </div>
                <Activity size={32} style={{ color: 'var(--secondary)', opacity: 0.3 }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Pathologies */}
        {profile?.pathologies?.length > 0 && (
          <motion.div variants={item}>
            <p className="section-label">Pathologies</p>
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {profile.pathologies.map(p => (
                  <span key={p.id} className="chip chip--sm" style={{ textTransform: 'capitalize' }}>⚠️ {p.zone.replace('_', ' ')}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Sign Out */}
        <motion.div variants={item} style={{ marginTop: 'var(--space-4)' }}>
          <button className="btn btn--danger btn--full" onClick={handleLogout} disabled={loggingOut}>
            <LogOut size={18} /> {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
