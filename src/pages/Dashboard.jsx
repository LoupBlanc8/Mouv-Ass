import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Flame, Droplets, Dumbbell, ChevronRight, Trophy, Plus, Minus } from 'lucide-react';
import { calculateMacros, calculateTDEE, calculateHydratation } from '../utils/calculations';
import { getRankProgress } from '../utils/gamification';

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
  const navigate = useNavigate();
  const { profile, user, sessions } = useAuth();
  const [hydration, setHydration] = useState({ eau_ml: 0, objectif_ml: 2500 });
  const [workoutCount, setWorkoutCount] = useState(0);
  const [nutritionLogs, setNutritionLogs] = useState([]);

  const today = new Date();
  const jourSemaine = today.getDay();
  const prenom = profile?.prenom || 'Athlète';

  const todaySession = sessions.find(s => s.jour_semaine === jourSemaine) || null;

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    const todayStr = today.toISOString().split('T')[0];
    
    // Hydration
    const { data: hyd } = await supabase.from('hydration_logs').select('*').eq('user_id', user.id).eq('date', todayStr).maybeSingle();
    if (hyd) setHydration(hyd);
    else {
      const obj = profile ? calculateHydratation(Number(profile.poids_kg) || 70) : 2500;
      setHydration({ eau_ml: 0, objectif_ml: obj });
    }
    
    // Nutrition
    const { data: nLogs } = await supabase.from('nutrition_logs').select('*').eq('user_id', user.id).eq('date', todayStr);
    setNutritionLogs(nLogs || []);

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

  let consumedCals = 0;
  let consumedPro = 0;
  let consumedGlu = 0;
  let consumedLip = 0;

  if (macros) {
    const meals = !!todaySession ? [
      { id: 'm1', ratio: 0.20 }, { id: 'm2', ratio: 0.30 }, { id: 'm3', ratio: 0.10 }, { id: 'm4', ratio: 0.15 }, { id: 'm5', ratio: 0.25 }
    ] : [
      { id: 'm1', ratio: 0.25 }, { id: 'm2', ratio: 0.10 }, { id: 'm3', ratio: 0.35 }, { id: 'm4', ratio: 0.30 }
    ];

    meals.forEach(meal => {
      const isConsumed = nutritionLogs.some(l => l.meal_id === meal.id && l.consomme);
      if (isConsumed) {
        consumedCals += Math.round(macros.calories * meal.ratio);
        consumedPro += Math.round(macros.proteines * meal.ratio);
        consumedGlu += Math.round(macros.glucides * meal.ratio);
        consumedLip += Math.round(macros.lipides * meal.ratio);
      }
    });
  }

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  // Calculate XP Progress
  const xpData = getRankProgress(profile?.xp || 0);

  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Editorial Header */}
        <motion.div variants={item} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 'var(--space-10)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <img 
              src="/logo-mouvbody.png" 
              alt="Mouv'Body" 
              className="app-logo app-logo--nav"
            />
            <div>
              <span className="body-sm text-muted" style={{ display: 'block', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '2px', textTransform: 'uppercase' }}>{greeting}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase' }}>{prenom} 👊</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
            {(profile?.streak_current || 0) > 0 && (
              <div style={{ background: 'rgba(255,107,0,0.1)', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <span style={{ fontSize: '0.8rem' }}>🔥</span>
                <span className="label-sm" style={{ color: '#FF6B00', fontWeight: 'bold' }}>{profile.streak_current}J</span>
              </div>
            )}
            <div style={{ 
              background: 'var(--surface-container-high)', 
              padding: 'var(--space-2) var(--space-3)', 
              borderRadius: 'var(--radius-xl)', 
              border: '1px solid rgba(var(--outline-variant), 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)' 
            }}>
              <Flame size={16} style={{ color: 'var(--primary)' }} />
              <span className="label-sm" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{workoutCount} S</span>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
          
          {/* Top Section: XP & Week Progress */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {/* XP Progress Card */}
            <motion.div variants={item} style={{ background: 'var(--surface-container-low)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', opacity: 0.1, color: 'var(--secondary)' }}>
                <Trophy size={160} />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Trophy size={20} style={{ color: 'var(--secondary)' }} />
                  <span className="title-md" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{xpData.currentRank}</span>
                </div>
                <span className="label-md" style={{ color: 'var(--secondary)', fontWeight: 700 }}>{profile?.xp || 0} XP</span>
              </div>
              <div className="progress-bar mb-3 relative z-10" style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="progress-bar__fill animate-pulse-glow" style={{ width: `${xpData.progress}%`, background: 'var(--secondary)' }} />
              </div>
              {xpData.nextRank && (
                <p className="label-sm text-right relative z-10" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>PLUS QUE {xpData.xpToNext} XP POUR <span style={{ color: 'var(--on-surface)' }}>{xpData.nextRank}</span></p>
              )}
            </motion.div>

            {/* Week Progress */}
            <motion.div variants={item} style={{ background: 'var(--surface-container)', padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
              <div className="full-bleed-scroll gap-3" style={{ justifyContent: 'space-between' }}>
                {JOURS.map((j, i) => {
                  const isToday = i === jourSemaine;
                  const isTrainingDay = (profile?.jours_semaine || []).includes(i);
                  const d = new Date(today);
                  d.setDate(today.getDate() - jourSemaine + i);
                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                      flex: 1, minWidth: '42px'
                    }}>
                      <span className="label-sm" style={{ color: isToday ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '0.6rem', fontWeight: 800 }}>{j.toUpperCase()}</span>
                      <div style={{
                        width: 38, height: 38, borderRadius: 'var(--radius-full)',
                        background: isToday ? 'var(--primary)' : isTrainingDay ? 'var(--surface-container-highest)' : 'transparent',
                        border: !isToday && !isTrainingDay ? '1px solid rgba(var(--outline-variant), 0.2)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isToday ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.85rem',
                        boxShadow: isToday ? '0 0 15px rgba(var(--primary-rgb), 0.4)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Today Session Card */}
          <motion.div variants={item}>
            <h2 className="title-lg" style={{ borderLeft: '4px solid var(--primary)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>SÉANCE DU JOUR</h2>
            {todaySession ? (
              <div className="card card--glow-primary" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div style={{ flex: 1 }}>
                    <h3 className="title-lg" style={{ textTransform: 'uppercase', marginBottom: 'var(--space-1)', fontSize: '1.4rem', lineHeight: 1.1 }}>{todaySession.nom}</h3>
                    <span className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{todaySession.duree_estimee} MIN • {todaySession.session_exercises?.length || 0} EXERCICES</span>
                  </div>
                  <div className="chip" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: 'var(--space-2) var(--space-4)', flexShrink: 0 }}>
                    <Dumbbell size={14} /> <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>{todaySession.type_session}</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-8" style={{ flexWrap: 'wrap' }}>
                  {(todaySession.session_exercises || []).slice(0, 4).map(se => (
                    <span key={se.id} className="chip chip--sm" style={{ background: 'var(--surface-container-high)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>{se.exercises?.nom}</span>
                  ))}
                  {(todaySession.session_exercises || []).length > 4 && <span className="chip chip--sm">+{todaySession.session_exercises.length - 4}</span>}
                </div>
                <button className="btn btn--primary btn--full" style={{ padding: 'var(--space-4)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }} onClick={() => navigate('/workout')}>
                  DÉMARRER LA SESSION <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <div style={{ background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', textAlign: 'center', padding: 'var(--space-10) var(--space-6)', border: '1px dashed rgba(var(--outline-variant), 0.3)' }}>
                <Trophy size={48} style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-4)', opacity: 0.5, margin: '0 auto' }} />
                <p className="title-lg" style={{ textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>JOUR DE REPOS</p>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-2)' }}>La récupération fait partie de l'entraînement.</p>
              </div>
            )}
          </motion.div>

          {/* Metrics Grid: Nutrition & Hydration */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Macros Summary */}
            {macros && (
              <motion.div variants={item}>
                <h2 className="title-lg" style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>NUTRITION</h2>
                <div style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                  <div className="flex items-center justify-between">
                    <ProgressRing size={100} stroke={8} progress={(consumedCals / macros.calories) * 100}>
                      <div style={{ textAlign: 'center', marginTop: -4 }}>
                        <span className="headline-md" style={{ color: 'var(--primary)' }}>{consumedCals}</span>
                        <span className="label-sm" style={{ display: 'block', color: 'var(--on-surface-variant)' }}>/ {macros.calories}</span>
                      </div>
                    </ProgressRing>
                    <div className="flex flex-col gap-4" style={{ flex: 1, marginLeft: 'var(--space-8)' }}>
                      {[
                        { label: 'PRO', consumed: consumedPro, val: macros.proteines, color: 'var(--primary)' },
                        { label: 'GLU', consumed: consumedGlu, val: macros.glucides, color: 'var(--secondary)' },
                        { label: 'LIP', consumed: consumedLip, val: macros.lipides, color: 'var(--tertiary)' },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>{m.label}</span>
                            <span className="label-sm" style={{ color: m.color, fontWeight: 700 }}>{m.consumed}/{m.val}g</span>
                          </div>
                          <div className="progress-bar" style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="progress-bar__fill" style={{ width: `${Math.min(100, (m.consumed / m.val) * 100)}%`, background: m.color }} />
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
              <h2 className="title-lg" style={{ borderLeft: '4px solid #00E5FF', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>HYDRATATION</h2>
              <div style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: macros ? '100%' : 'auto' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div style={{ padding: 'var(--space-2)', background: 'rgba(0, 229, 255, 0.1)', borderRadius: 'var(--radius-full)' }}>
                        <Droplets size={24} style={{ color: '#00E5FF' }} />
                      </div>
                      <div>
                        <span className="headline-md">{(hydration.eau_ml / 1000).toFixed(1)}L</span>
                        <span className="label-md" style={{ color: 'var(--on-surface-variant)', marginLeft: '4px' }}>/ {(hydration.objectif_ml / 1000).toFixed(1)}L</span>
                      </div>
                    </div>
                    <span className="title-md" style={{ color: '#00E5FF' }}>{Math.round((hydration.eau_ml / hydration.objectif_ml) * 100)}%</span>
                  </div>
                  <div className="progress-bar mb-6" style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="progress-bar__fill" style={{ width: `${Math.min(100, (hydration.eau_ml / hydration.objectif_ml) * 100)}%`, background: '#00E5FF', boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }} />
                  </div>
                </div>
                <div className="flex gap-2 justify-center mt-auto">
                  <button className="btn btn--sm" style={{ flex: 1, background: 'var(--surface-container-high)', border: '1px solid rgba(var(--outline-variant), 0.2)' }} onClick={() => addWater(-250)}><Minus size={16} /> 250ML</button>
                  <button className="btn btn--sm" style={{ flex: 1, background: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }} onClick={() => addWater(250)}><Plus size={16} /> 250ML</button>
                  <button className="btn btn--sm" style={{ flex: 1, background: '#00E5FF', color: '#000', border: 'none' }} onClick={() => addWater(500)}><Plus size={16} /> 500ML</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
