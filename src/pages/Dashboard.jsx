import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Flame, Droplets, Dumbbell, ChevronRight, Trophy, Plus, Minus } from 'lucide-react';
import { calculateMacros, calculateTDEE, calculateHydratation } from '../utils/calculations';

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function ProgressRing({ size = 80, stroke = 6, progress = 0, color = 'var(--primary)', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(progress, 100) / 100) * circ;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg className="progress-ring__svg" width={size} height={size}>
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="var(--primary-container)" /></linearGradient></defs>
        <circle className="progress-ring__track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
        <circle className="progress-ring__fill" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} stroke={color} strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.33,1,0.68,1)' }} />
      </svg>
      <div className="progress-ring__center">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [hydration, setHydration] = useState({ eau_ml: 0, objectif_ml: 2500 });
  const [todaySession, setTodaySession] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);

  const today = new Date();
  const jourSemaine = today.getDay();
  const prenom = profile?.prenom || 'Athlète';

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    // Hydration
    const todayStr = today.toISOString().split('T')[0];
    const { data: hyd } = await supabase.from('hydration_logs').select('*').eq('user_id', user.id).eq('date', todayStr).maybeSingle();
    if (hyd) setHydration(hyd);
    else {
      const obj = profile ? calculateHydratation(Number(profile.poids_kg) || 70) : 2500;
      setHydration({ eau_ml: 0, objectif_ml: obj });
    }
    // Today session
    const { data: prog } = await supabase.from('programs').select('id').eq('user_id', user.id).eq('actif', true).maybeSingle();
    if (prog) {
      const { data: sess } = await supabase.from('sessions').select('*, session_exercises(*, exercises(*))').eq('program_id', prog.id).eq('jour_semaine', jourSemaine).maybeSingle();
      setTodaySession(sess);
    }
    // Workout count this week
    const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - jourSemaine);
    const { count } = await supabase.from('workout_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('date', startOfWeek.toISOString().split('T')[0]);
    setWorkoutCount(count || 0);
  }

  async function addWater(ml) {
    const newMl = Math.max(0, hydration.eau_ml + ml);
    setHydration(prev => ({ ...prev, eau_ml: newMl }));
    const todayStr = today.toISOString().split('T')[0];
    await supabase.from('hydration_logs').upsert({ user_id: user.id, date: todayStr, eau_ml: newMl, objectif_ml: hydration.objectif_ml }, { onConflict: 'user_id,date' });
  }

  // Macros calculation
  const macros = profile?.metabolisme_base
    ? calculateMacros(
        calculateTDEE(Number(profile.metabolisme_base), (profile.jours_semaine || []).length),
        Number(profile.poids_kg), profile.objectif, profile.morphotype, !!todaySession
      )
    : null;

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={item} className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <p className="label-sm text-primary">{greeting}</p>
            <h1 className="headline-md">{prenom} 👊</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Flame size={18} className="text-warning" />
            <span className="title-md">{workoutCount}</span>
          </div>
        </motion.div>

        {/* Week Progress */}
        <motion.div variants={item} className="flex gap-2 mb-6" style={{ justifyContent: 'space-between' }}>
          {JOURS.map((j, i) => {
            const isToday = i === jourSemaine;
            const isTrainingDay = (profile?.jours_semaine || []).includes(i);
            return (
              <div key={j} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)',
              }}>
                <span className="label-sm" style={{ color: isToday ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '0.625rem' }}>{j}</span>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-lg)',
                  background: isToday ? 'linear-gradient(135deg, var(--primary), var(--primary-dim))' : isTrainingDay ? 'var(--surface-container-highest)' : 'var(--surface-container)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isToday ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.8125rem',
                  boxShadow: isToday ? '0 0 20px rgba(129,236,255,0.25)' : 'none'
                }}>{today.getDate() - jourSemaine + i}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Today Session Card */}
        <motion.div variants={item}>
          <p className="section-label">Séance du jour</p>
          {todaySession ? (
            <div className="card card--glow-primary" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="title-md">{todaySession.nom}</h3>
                  <span className="body-sm">{todaySession.duree_estimee} min · {todaySession.session_exercises?.length || 0} exercices</span>
                </div>
                <div className="chip chip--primary"><Dumbbell size={14} /> {todaySession.type_session}</div>
              </div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {(todaySession.session_exercises || []).slice(0, 4).map(se => (
                  <span key={se.id} className="chip chip--sm">{se.exercises?.nom}</span>
                ))}
                {(todaySession.session_exercises || []).length > 4 && <span className="chip chip--sm">+{todaySession.session_exercises.length - 4}</span>}
              </div>
              <button className="btn btn--primary btn--full" style={{ marginTop: 'var(--space-5)' }}>
                Commencer <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8) var(--space-6)' }}>
              <Trophy size={32} className="text-muted" style={{ marginBottom: 'var(--space-3)', opacity: 0.4 }} />
              <p className="body-md text-muted">Jour de repos</p>
              <p className="body-sm">Profite pour bien récupérer 🧘</p>
            </div>
          )}
        </motion.div>

        {/* Macros Summary */}
        {macros && (
          <motion.div variants={item}>
            <p className="section-label">Nutrition du jour</p>
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center justify-between">
                <ProgressRing size={90} stroke={7} progress={0}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="headline-sm text-primary">{macros.calories}</span>
                    <span className="label-sm text-muted" style={{ display: 'block' }}>kcal</span>
                  </div>
                </ProgressRing>
                <div className="flex flex-col gap-3" style={{ flex: 1, marginLeft: 'var(--space-6)' }}>
                  {[
                    { label: 'Protéines', val: macros.proteines, unit: 'g', color: 'var(--primary)' },
                    { label: 'Glucides', val: macros.glucides, unit: 'g', color: 'var(--secondary)' },
                    { label: 'Lipides', val: macros.lipides, unit: 'g', color: 'var(--tertiary)' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="label-sm text-muted">{m.label}</span>
                        <span className="body-sm" style={{ color: m.color, fontWeight: 600 }}>{m.val}{m.unit}</span>
                      </div>
                      <div className="progress-bar" style={{ height: 3 }}>
                        <div className="progress-bar__fill" style={{ width: '0%', background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hydration */}
        <motion.div variants={item}>
          <p className="section-label">Hydratation</p>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Droplets size={20} className="text-primary" />
                <span className="title-md">{(hydration.eau_ml / 1000).toFixed(1)}L</span>
                <span className="body-sm text-muted">/ {(hydration.objectif_ml / 1000).toFixed(1)}L</span>
              </div>
              <span className="label-md text-primary">{Math.round((hydration.eau_ml / hydration.objectif_ml) * 100)}%</span>
            </div>
            <div className="progress-bar mb-4">
              <div className="progress-bar__fill" style={{ width: `${Math.min(100, (hydration.eau_ml / hydration.objectif_ml) * 100)}%` }} />
            </div>
            <div className="flex gap-2 justify-center">
              <button className="btn btn--secondary btn--sm" onClick={() => addWater(-250)}><Minus size={14} /> 250ml</button>
              <button className="btn btn--primary btn--sm" onClick={() => addWater(250)}><Plus size={14} /> 250ml</button>
              <button className="btn btn--primary btn--sm" onClick={() => addWater(500)}><Plus size={14} /> 500ml</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
