import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, ChevronRight, Timer, Dumbbell, ChevronDown, Zap } from 'lucide-react';
import { addXP } from '../utils/gamification';

const JOURS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function Workout() {
  const { profile, user, program, sessions } = useAuth();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [xpEarned, setXpEarned] = useState(null);
  const timerRef = useRef(null);

  const todaySession = sessions.find(s => s.jour_semaine === selectedDay);

  function startWorkout() {
    if (!todaySession) return;
    setActiveWorkout(todaySession);
    setCurrentExIdx(0);
    setCurrentSet(1);
    setLogs([]);
    setWeight('');
    setReps('');
    setSessionStartTime(new Date());
    setXpEarned(null);
  }

  function logSet() {
    if (!weight || !reps) return;
    const ex = activeWorkout.session_exercises[currentExIdx];
    const log = { 
      exercise_id: ex.exercise_id, 
      serie: currentSet, 
      poids_kg: parseFloat(weight), 
      reps: parseInt(reps), 
      session_id: activeWorkout.id,
      exercise_nom: ex.exercises?.nom
    };
    setLogs(prev => [...prev, log]);

    if (currentSet < ex.series) {
      setCurrentSet(prev => prev + 1);
      startRest(ex.repos_secondes || 90);
    } else if (currentExIdx < activeWorkout.session_exercises.length - 1) {
      setCurrentExIdx(prev => prev + 1);
      setCurrentSet(1);
      setWeight('');
      setReps('');
      startRest((ex.repos_secondes || 90) + 30);
    } else {
      finishWorkout([...logs, log]); // Pass the updated logs explicitly
    }
  }

  function startRest(seconds) {
    setRestTimer(seconds);
    setIsResting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRestTimer(prev => { if (prev <= 1) { clearInterval(timerRef.current); setIsResting(false); return 0; } return prev - 1; });
    }, 1000);
  }

  function skipRest() { clearInterval(timerRef.current); setIsResting(false); setRestTimer(0); }

  async function finishWorkout(finalLogs = logs) {
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime - sessionStartTime) / 1000);
    const totalVolume = finalLogs.reduce((sum, l) => sum + (l.poids_kg * l.reps), 0);
    
    // Add XP
    const xpResult = await addXP(user.id, 100);
    setXpEarned(100);
    
    // Save to workout_logs with volume
    if (finalLogs.length > 0) {
      const toInsert = finalLogs.map(l => ({ 
        exercise_id: l.exercise_id,
        serie: l.serie,
        poids_kg: l.poids_kg,
        reps: l.reps,
        session_id: l.session_id,
        user_id: user.id, 
        date: new Date().toISOString().split('T')[0],
        volume_total: totalVolume,
        duree_secondes: durationSeconds
      }));
      await supabase.from('workout_logs').insert(toInsert);
      
      // Also save to exercise_logs for new schema
      const exerciseLogsInsert = finalLogs.map(l => ({
        user_id: user.id,
        exercise_nom: l.exercise_nom || 'Unknown',
        set_number: l.serie,
        reps: l.reps,
        weight: l.poids_kg
      }));
      await supabase.from('exercise_logs').insert(exerciseLogsInsert);
    }
    
    setTimeout(() => {
      setActiveWorkout(null);
    }, 3000); // Wait a bit to show success screen
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  // Active workout view
  if (activeWorkout) {
    const ex = activeWorkout.session_exercises[currentExIdx];
    const exercise = ex?.exercises;
    
    // Si l'entraînement vient d'être terminé et on affiche le succès
    if (xpEarned) {
      return (
        <div className="page" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          minHeight: '80vh', backgroundColor: '#0e0e0e', padding: 'var(--space-6)' 
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="card"
            style={{ 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(124, 77, 255, 0.1))',
              backdropFilter: 'blur(20px)',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 229, 255, 0.1)'
            }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(0, 229, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)'
            }}>
              <Check size={40} color="#00E5FF" />
            </div>
            <h2 className="display-sm" style={{ color: '#fff', marginBottom: 'var(--space-2)' }}>Entraînement Terminé !</h2>
            <div className="flex items-center justify-center gap-2 mb-6 text-primary">
              <Zap size={20} fill="#00E5FF" />
              <span className="title-lg">+{xpEarned} XP</span>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="page" style={{ paddingBottom: 'var(--space-8)', backgroundColor: '#0e0e0e', minHeight: '100vh', color: '#fff' }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="label-sm" style={{ color: '#00E5FF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{activeWorkout.nom}</p>
            <h2 className="headline-md" style={{ fontFamily: 'Space Grotesk' }}>EXERCICE {currentExIdx + 1}<span style={{ color: '#484847' }}>/{activeWorkout.session_exercises.length}</span></h2>
          </div>
          <button className="btn btn--sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#adaaaa', border: 'none' }} onClick={() => finishWorkout(logs)}>Terminer</button>
        </div>

        <motion.div key={currentExIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          style={{ 
            backgroundColor: '#1a1919', borderRadius: '1.5rem', padding: 'var(--space-6)', marginBottom: 'var(--space-6)',
            position: 'relative', overflow: 'hidden'
          }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(126, 81, 255, 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
          <h3 className="title-lg mb-2" style={{ fontFamily: 'Space Grotesk' }}>{exercise?.nom}</h3>
          <p className="body-sm mb-6" style={{ color: '#adaaaa' }}>{exercise?.description_technique}</p>
          
          <div className="flex gap-4">
            <div style={{ flex: 1, backgroundColor: '#131313', padding: 'var(--space-3)', borderRadius: '1rem' }}>
              <span className="label-sm" style={{ color: '#767575', display: 'block', marginBottom: '4px' }}>OBJECTIF</span>
              <div className="title-md" style={{ color: '#00E5FF' }}>{ex.series} × {ex.reps_min}-{ex.reps_max}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#131313', padding: 'var(--space-3)', borderRadius: '1rem' }}>
              <span className="label-sm" style={{ color: '#767575', display: 'block', marginBottom: '4px' }}>REPOS</span>
              <div className="title-md">{ex.repos_secondes || 90}s</div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div key="resting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 140, marginBottom: 'var(--space-6)' }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="66" fill="none" stroke="#262626" strokeWidth="4" />
                  <circle cx="70" cy="70" r="66" fill="none" stroke="#00E5FF" strokeWidth="4" strokeDasharray="414" strokeDashoffset={414 - (414 * restTimer / (ex.repos_secondes || 90))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Timer size={24} color="#00E5FF" style={{ marginBottom: 4 }} />
                  <span className="display-sm" style={{ color: '#00E5FF', fontFamily: 'Space Grotesk' }}>
                    {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div>
                <button className="btn btn--sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '2rem', padding: '10px 24px' }} onClick={skipRest}>
                  Passer le repos
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="logging" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ backgroundColor: '#1a1919', borderRadius: '1.5rem', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="title-md">Série {currentSet} <span style={{ color: '#767575' }}>/ {ex.series}</span></span>
                </div>
                
                <div className="flex gap-4 mb-6">
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ color: '#adaaaa', display: 'block', marginBottom: '8px' }}>POIDS (KG)</label>
                    <input type="number" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" 
                      style={{ 
                        width: '100%', backgroundColor: '#131313', border: 'none', borderBottom: '2px solid #262626', 
                        color: '#fff', padding: '12px 16px', fontSize: '1.25rem', fontFamily: 'Space Grotesk', borderRadius: '8px 8px 0 0',
                        outline: 'none', transition: 'border-color 0.2s'
                      }} 
                      onFocus={e => e.target.style.borderColor = '#00E5FF'}
                      onBlur={e => e.target.style.borderColor = '#262626'}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ color: '#adaaaa', display: 'block', marginBottom: '8px' }}>RÉPÉTITIONS</label>
                    <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" 
                      style={{ 
                        width: '100%', backgroundColor: '#131313', border: 'none', borderBottom: '2px solid #262626', 
                        color: '#fff', padding: '12px 16px', fontSize: '1.25rem', fontFamily: 'Space Grotesk', borderRadius: '8px 8px 0 0',
                        outline: 'none', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#00E5FF'}
                      onBlur={e => e.target.style.borderColor = '#262626'}
                    />
                  </div>
                </div>

                <button onClick={logSet} disabled={!weight || !reps}
                  style={{ 
                    width: '100%', background: (!weight || !reps) ? '#262626' : 'linear-gradient(135deg, #00E5FF 0%, #00d4ec 100%)',
                    color: (!weight || !reps) ? '#767575' : '#0e0e0e',
                    border: 'none', padding: '16px', borderRadius: '2rem', fontSize: '1rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: (!weight || !reps) ? 'none' : '0 4px 12px rgba(0, 229, 255, 0.3)',
                    transition: 'all 0.2s'
                  }}>
                  <Check size={20} /> VALIDER & REPOS
                </button>
              </div>

              {/* Logged sets summary */}
              {logs.filter(l => l.exercise_id === ex.exercise_id).length > 0 && (
                <div style={{ padding: '0 var(--space-4)' }}>
                  <p className="label-sm mb-4" style={{ color: '#767575', letterSpacing: '0.05em' }}>HISTORIQUE DES SÉRIES</p>
                  {logs.filter(l => l.exercise_id === ex.exercise_id).map((l, i) => (
                    <div key={i} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid #1a1919' }}>
                      <span className="body-md" style={{ color: '#adaaaa' }}>Série {l.serie}</span>
                      <span className="title-md" style={{ color: '#fff' }}>{l.poids_kg}kg × {l.reps}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Program view
  return (
    <div className="page">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="page-header">
          <h1 className="headline-md">Entraînement</h1>
          {program && <span className="chip chip--selected">{program.nom}</span>}
        </motion.div>

        {!program ? (
          <motion.div variants={item} className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <Dumbbell size={48} style={{ color: 'var(--outline)', marginBottom: 'var(--space-4)', opacity: 0.3 }} />
            <h3 className="title-md mb-2">Pas encore de programme</h3>
            <p className="body-sm text-muted">Complète l'onboarding pour générer ton programme personnalisé.</p>
          </motion.div>
        ) : (
          <>
            {/* Day selector */}
            <motion.div variants={item} className="flex gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
              {JOURS_FULL.map((j, i) => (
                <button key={j} onClick={() => setSelectedDay(i)}
                  className={`chip ${selectedDay === i ? 'chip--selected' : ''}`}
                  style={{ flexShrink: 0 }}>{j.slice(0, 3)}</button>
              ))}
            </motion.div>

            {/* Session */}
            {todaySession ? (
              <motion.div variants={item}>
                <div className="card card--elevated mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="title-lg">{todaySession.nom}</h3>
                      <span className="body-sm text-muted">{todaySession.type_session} · {todaySession.duree_estimee} min</span>
                    </div>
                    <div className="chip chip--primary">{todaySession.session_exercises?.length || 0} ex.</div>
                  </div>

                  {(todaySession.session_exercises || []).map((se, i) => (
                    <div key={se.id} className="card card--recessed" style={{ marginBottom: i < todaySession.session_exercises.length - 1 ? 'var(--space-3)' : 0, padding: 'var(--space-4)' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="body-md" style={{ fontWeight: 600 }}>{se.exercises?.nom}</p>
                          <p className="body-sm text-muted">{se.series} × {se.reps_min}-{se.reps_max} · {se.repos_secondes}s repos</p>
                        </div>
                        <ChevronDown size={16} style={{ color: 'var(--outline)' }} />
                      </div>
                    </div>
                  ))}

                  <button className="btn btn--primary btn--full" style={{ marginTop: 'var(--space-5)' }} onClick={startWorkout}>
                    <Play size={18} /> Démarrer la séance
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div variants={item} className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <p className="body-md text-muted">Repos ce jour-là 🧘</p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
