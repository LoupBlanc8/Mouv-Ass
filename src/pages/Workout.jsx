import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, ChevronRight, Timer, Dumbbell, ChevronDown, Zap, Repeat, X, Dice5, Flame, RefreshCw } from 'lucide-react';
import { addXP, calculateSessionXP, updateStreak } from '../utils/gamification';
import { estimateKcalBurned } from '../utils/loadCalculator';
import ExerciseRoulette from '../components/ui/ExerciseRoulette';

const JOURS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function getExerciseImage(nom) {
  const nomLower = (nom || '').toLowerCase();
  
  // Specific Exact Matches
  if (nomLower.includes('incliné') || nomLower.includes('incline')) return '/exercises/developpe-incline-halteres.gif';
  if (nomLower.includes('face pull')) return '/exercises/face-pull.gif';
  if (nomLower.includes('élévation') || nomLower.includes('elevation') || nomLower.includes('oiseau') || nomLower.includes('latérale')) return '/exercises/elevations-laterales.gif';
  
  // Biceps
  if (nomLower.includes('curl alterné') || nomLower.includes('assis') || nomLower.includes('incliné') || nomLower.includes('marteau')) return '/exercises/curl-biceps-alterne-assis.gif';
  if (nomLower.includes('curl') || nomLower.includes('biceps')) return '/exercises/curl-biceps.gif';
  
  // Back / Dos
  if (nomLower.includes('rowing')) return '/exercises/rowing-haltere.gif';
  if (nomLower.includes('traction') || nomLower.includes('pull') || nomLower.includes('muscle-up')) return '/exercises/traction.gif';
  if (nomLower.includes('tirage')) return '/exercises/traction.gif'; // Fallback
  
  // Legs / Jambes
  if (nomLower.includes('hip thrust')) return '/exercises/hips-thrust.gif';
  if (nomLower.includes('leg curl')) return '/exercises/leg-curl.gif';
  if (nomLower.includes('leg press') || nomLower.includes('presse')) return '/exercises/leg-presse.gif';
  if (nomLower.includes('mollet')) return '/exercises/mollet-debout.gif';
  if (nomLower.includes('goblet')) return '/exercises/squat-goblet.gif';
  if (nomLower.includes('squat') || nomLower.includes('fente') || nomLower.includes('leg')) return '/exercises/squat.gif';
  if (nomLower.includes('terre') || nomLower.includes('deadlift')) return '/exercises/souleve-de-terre.gif';
  
  // Push / Pectoraux
  if (nomLower.includes('développé couché') || nomLower.includes('bench press') || nomLower.includes('écarté')) return '/exercises/developpe-couche.gif';
  if (nomLower.includes('pompe') || nomLower.includes('push-up')) return '/exercises/pompe.gif';
  if (nomLower.includes('dips')) return '/exercises/dips.gif';
  
  // Shoulders / Triceps
  if (nomLower.includes('militaire') || nomLower.includes('épaule') || nomLower.includes('arnold')) return '/exercises/presse-militaire.gif';
  if (nomLower.includes('triceps') || nomLower.includes('front') || nomLower.includes('kickback')) return '/exercises/triceps-poulie.gif';
  
  // Core / Abdos
  if (nomLower.includes('gainage') || nomLower.includes('planche') || nomLower.includes('crunch') || nomLower.includes('ab') || nomLower.includes('twist')) return '/exercises/Gainage.gif';

  // Absolute fallback
  return '/exercises/squat.gif';
}

export default function Workout() {
  const navigate = useNavigate();
  const { profile, user, program, sessions, refreshProfile, refreshProgram } = useAuth();
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
  const [totalKcal, setTotalKcal] = useState(0);
  const [streakInfo, setStreakInfo] = useState(null);
  const [showRoulette, setShowRoulette] = useState(false);
  const [allExercises, setAllExercises] = useState([]);
  const [regenerating, setRegenerating] = useState(false);
  const timerRef = useRef(null);

  // Replace modal state
  const [replaceModal, setReplaceModal] = useState({ open: false, sessionExercise: null, alternatives: [], loading: false });

  // Load all exercises for roulette
  useEffect(() => {
    supabase.from('exercises').select('*').then(({ data }) => {
      if (data) setAllExercises(data);
    });
  }, []);

  const todaySession = sessions.find(s => s.jour_semaine === selectedDay);

  async function handleReplaceClick(se) {
    setReplaceModal({ open: true, sessionExercise: se, alternatives: [], loading: true });
    try {
      const muscles = se.exercises?.muscles_principaux || [];
      let query = supabase.from('exercises').select('*').neq('id', se.exercise_id);
      
      if (muscles.length > 0) {
        query = query.contains('muscles_principaux', [muscles[0]]);
      }
      
      const { data, error } = await query.limit(10);
      if (error) throw error;
      setReplaceModal(prev => ({ ...prev, alternatives: data, loading: false }));
    } catch (err) {
      console.error(err);
      setReplaceModal(prev => ({ ...prev, loading: false }));
    }
  }

  async function confirmReplace(newExerciseId) {
    try {
      const seId = replaceModal.sessionExercise.id;
      const { error } = await supabase.from('session_exercises')
        .update({ exercise_id: newExerciseId })
        .eq('id', seId);
      if (error) throw error;
      
      // We should ideally refresh the program/sessions here. 
      // Assuming a page reload or state update is acceptable.
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Erreur lors du remplacement');
    }
  }

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
    
    // Calculate XP based on actual performance (min 3 exercises)
    const xpAmount = calculateSessionXP(finalLogs);
    if (xpAmount > 0) {
      await addXP(user.id, xpAmount);
    }
    setXpEarned(xpAmount);

    // Update streak
    const streak = await updateStreak(user.id);
    setStreakInfo(streak);

    // Estimate total kcal
    const durationMinutes = durationSeconds / 60;
    const kcal = estimateKcalBurned(profile?.poids_kg || 70, durationMinutes, 'hypertrophie', profile?.niveau);
    setTotalKcal(kcal);
    
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
      
      const exerciseLogsInsert = finalLogs.map(l => ({
        user_id: user.id,
        exercise_nom: l.exercise_nom || 'Unknown',
        set_number: l.serie,
        reps: l.reps,
        weight: l.poids_kg
      }));
      await supabase.from('exercise_logs').insert(exerciseLogsInsert);
    }

    // Refresh profile to sync XP/streak in global state
    await refreshProfile();
    
    setTimeout(() => {
      setActiveWorkout(null);
    }, 4000);
  }

  async function handleRegenerate() {
    if (regenerating) return;
    setRegenerating(true);
    try {
      // Deactivate current program
      if (program) {
        await supabase.from('programs').update({ actif: false }).eq('id', program.id);
      }
      await refreshProgram();
      // Redirect to onboarding to regenerate
      window.location.href = '/onboarding';
    } catch (err) {
      console.error(err);
      setRegenerating(false);
    }
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  // Active workout view
  if (activeWorkout) {
    const ex = activeWorkout.session_exercises[currentExIdx];
    const exercise = ex?.exercises;
    
    // Si la session ne contient aucun exercice
    if (!ex && xpEarned === null) {
      return (
        <div className="page" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          minHeight: '80vh', backgroundColor: 'var(--surface)', padding: 'var(--space-6)', textAlign: 'center' 
        }}>
          <h2 className="title-lg" style={{ color: 'var(--error)', marginBottom: 'var(--space-4)' }}>Séance Vide</h2>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-6)' }}>
            Il n'y a aucun exercice assigné à cette séance. C'est probablement dû à une ancienne génération de programme.
          </p>
          <button className="btn btn--primary" onClick={handleRegenerate} disabled={regenerating} style={{ padding: '16px', borderRadius: 'var(--radius-xl)' }}>
            {regenerating ? 'Regénération...' : 'Regénérer mon programme'}
          </button>
          <button className="btn btn--sm" style={{ marginTop: 'var(--space-4)', backgroundColor: 'transparent', color: 'var(--on-surface-variant)' }} onClick={() => setActiveWorkout(null)}>
            Retour au tableau de bord
          </button>
        </div>
      );
    }
    
    // Si l'entraînement vient d'être terminé et on affiche le succès
    if (xpEarned !== null) {
      return (
        <div className="page" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          minHeight: '80vh', backgroundColor: 'var(--surface)', padding: 'var(--space-6)' 
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="card"
            style={{ 
              textAlign: 'center', width: '100%', maxWidth: 400,
              background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--secondary-rgb), 0.1))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(var(--primary-rgb), 0.2)',
              boxShadow: '0 8px 32px rgba(var(--primary-rgb), 0.1)'
            }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(var(--primary-rgb), 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)',
              boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.4)'
            }}>
              <Check size={40} color="var(--primary)" />
            </div>
            <h2 className="display-sm" style={{ color: 'var(--on-surface)', marginBottom: 'var(--space-4)' }}>Entraînement Terminé !</h2>
            
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                <Zap size={18} style={{ color: 'var(--primary)', marginBottom: 4 }} />
                <div className="title-md" style={{ color: 'var(--primary)' }}>+{xpEarned}</div>
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>XP</span>
              </div>
              <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                <Flame size={18} style={{ color: '#FF6B00', marginBottom: 4 }} />
                <div className="title-md" style={{ color: '#FF6B00' }}>~{totalKcal}</div>
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>KCAL</span>
              </div>
              {streakInfo && (
                <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
                  <Flame size={18} style={{ color: '#FF4081', marginBottom: 4 }} />
                  <div className="title-md" style={{ color: '#FF4081' }}>{streakInfo.streak}🔥</div>
                  <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>STREAK</span>
                </div>
              )}
            </div>

            {xpEarned === 0 && (
              <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-4)' }}>
                Fais au moins 3 exercices pour gagner de l'XP !
              </p>
            )}
          </motion.div>
        </div>
      );
    }

    return (
      <div className="page" style={{ paddingBottom: 'var(--space-8)', backgroundColor: 'var(--surface)', minHeight: '100vh', color: 'var(--on-surface)' }}>
        <div className="flex items-center justify-between mb-8" style={{ marginTop: 'var(--space-4)' }}>
          <div>
            <p className="label-sm" style={{ color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 'bold' }}>{activeWorkout.nom}</p>
            <h2 className="display-sm" style={{ margin: 0, textTransform: 'uppercase', lineHeight: 1 }}>EXERCICE {currentExIdx + 1}<span style={{ color: 'var(--on-surface-variant)' }}>/{activeWorkout.session_exercises.length}</span></h2>
          </div>
          <button className="btn btn--sm" style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid rgba(var(--outline-variant), 0.2)' }} onClick={() => finishWorkout(logs)}>Terminer</button>
        </div>

        <motion.div key={currentExIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          style={{ 
            backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)',
            position: 'relative', overflow: 'hidden', border: '1px solid rgba(var(--outline-variant), 0.1)'
          }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundImage: `url(${getExerciseImage(exercise?.nom)})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(var(--secondary-rgb), 0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', zIndex: 0 }}></div>
          <h3 className="title-lg mb-2" style={{ position: 'relative', zIndex: 1, textTransform: 'uppercase' }}>{exercise?.nom}</h3>
          <p className="body-sm mb-6" style={{ color: 'var(--on-surface-variant)', position: 'relative', zIndex: 1 }}>{exercise?.description_technique}</p>
          
          <div className="flex gap-4" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1, backgroundColor: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>OBJECTIF</span>
              <div className="title-md" style={{ color: 'var(--primary)' }}>{ex.series} × {ex.reps_min}-{ex.reps_max}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>REPOS</span>
              <div className="title-md" style={{ color: 'var(--on-surface)' }}>{ex.repos_secondes || 90}s</div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div key="resting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 140, marginBottom: 'var(--space-6)' }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="70" cy="70" r="66" fill="none" stroke="var(--surface-container-highest)" strokeWidth="4" />
                  <circle cx="70" cy="70" r="66" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="414" strokeDashoffset={414 - (414 * restTimer / (ex.repos_secondes || 90))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Timer size={24} color="var(--primary)" style={{ marginBottom: 4 }} />
                  <span className="display-md" style={{ color: 'var(--primary)', lineHeight: 1 }}>
                    {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div>
                <button className="btn btn--sm" style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid rgba(var(--outline-variant), 0.2)', borderRadius: 'var(--radius-xl)', padding: '10px 24px' }} onClick={skipRest}>
                  Passer le repos
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="logging" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ backgroundColor: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                <div className="flex items-center justify-between mb-6">
                  <span className="title-md" style={{ textTransform: 'uppercase' }}>Série {currentSet} <span style={{ color: 'var(--on-surface-variant)' }}>/ {ex.series}</span></span>
                </div>
                
                <div className="flex gap-4 mb-6">
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>POIDS (KG)</label>
                    <input type="number" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" 
                      style={{ 
                        width: '100%', backgroundColor: 'var(--surface-container-high)', border: 'none', borderBottom: '2px solid var(--outline-variant)', 
                        color: 'var(--on-surface)', padding: '12px 16px', fontSize: '1.25rem', borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                        outline: 'none', transition: 'border-color 0.2s'
                      }} 
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>RÉPÉTITIONS</label>
                    <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" 
                      style={{ 
                        width: '100%', backgroundColor: 'var(--surface-container-high)', border: 'none', borderBottom: '2px solid var(--outline-variant)', 
                        color: 'var(--on-surface)', padding: '12px 16px', fontSize: '1.25rem', borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                        outline: 'none', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
                    />
                  </div>
                </div>

                <button onClick={logSet} disabled={!weight || !reps}
                  style={{ 
                    width: '100%', background: (!weight || !reps) ? 'var(--surface-container-highest)' : 'var(--primary)',
                    color: (!weight || !reps) ? 'var(--on-surface-variant)' : 'var(--on-primary)',
                    border: 'none', padding: '16px', borderRadius: 'var(--radius-xl)', fontSize: '1rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: (!weight || !reps) ? 'none' : '0 4px 12px rgba(var(--primary-rgb), 0.3)',
                    transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                  <Check size={20} /> VALIDER & REPOS
                </button>
              </div>

              {/* Logged sets summary */}
              {logs.filter(l => l.exercise_id === ex.exercise_id).length > 0 && (
                <div style={{ padding: '0 var(--space-4)' }}>
                  <p className="label-sm mb-4" style={{ color: 'var(--on-surface-variant)', letterSpacing: '0.05em', fontWeight: 'bold' }}>HISTORIQUE DES SÉRIES</p>
                  {logs.filter(l => l.exercise_id === ex.exercise_id).map((l, i) => (
                    <div key={i} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--surface-container-high)' }}>
                      <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Série {l.serie}</span>
                      <span className="title-md" style={{ color: 'var(--on-surface)' }}>{l.poids_kg}kg × {l.reps}</span>
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
        <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-10)', marginTop: 'var(--space-4)' }}>
          <div>
            <h1 className="display-sm" style={{ textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
              TRAINING<br />
              <span style={{ color: 'var(--primary)' }}>PROGRAM</span>
            </h1>
          </div>
          {program && (
            <div style={{ marginBottom: '4px', background: 'var(--surface-container-high)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
              <span className="label-md" style={{ color: 'var(--on-surface)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {program.nom}
              </span>
            </div>
          )}
        </motion.div>

        {!program ? (
          <motion.div variants={item} className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)', background: 'var(--surface-container-low)', border: '1px dashed var(--outline-variant)' }}>
            <Dumbbell size={48} style={{ color: 'var(--outline)', marginBottom: 'var(--space-4)', opacity: 0.5 }} />
            <h3 className="title-lg mb-2">Pas encore de programme</h3>
            <p className="body-md text-muted">Complète l'onboarding pour générer ton programme personnalisé.</p>
            <button className="btn btn--primary" style={{ marginTop: 'var(--space-6)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }} onClick={() => navigate('/onboarding')}>
              Créer mon programme
            </button>
          </motion.div>
        ) : (
          <>
            {/* Day selector */}
            <motion.div variants={item} className="flex gap-2 mb-8" style={{ overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
              {JOURS_FULL.map((j, i) => (
                <button key={j} onClick={() => setSelectedDay(i)}
                  className={`chip ${selectedDay === i ? 'chip--primary' : ''}`}
                  style={{ 
                    flexShrink: 0, 
                    fontWeight: selectedDay === i ? 'bold' : 'normal',
                    backgroundColor: selectedDay === i ? 'var(--primary)' : 'var(--surface-container-high)',
                    color: selectedDay === i ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    border: selectedDay === i ? 'none' : '1px solid rgba(var(--outline-variant), 0.2)'
                  }}>{j.slice(0, 3)}</button>
              ))}
            </motion.div>

            {/* Session */}
            {todaySession ? (
              <motion.div variants={item}>
                <div className="card" style={{ background: 'var(--surface-container-low)', border: '1px solid rgba(var(--outline-variant), 0.1)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="display-sm" style={{ textTransform: 'uppercase', margin: 0, lineHeight: 1.1 }}>{todaySession.nom}</h3>
                      <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{todaySession.type_session} · {todaySession.duree_estimee} min</span>
                    </div>
                    <div className="chip" style={{ background: 'var(--surface-container-high)', border: '1px solid rgba(var(--outline-variant), 0.2)', fontWeight: 'bold' }}>{todaySession.session_exercises?.length || 0} EX.</div>
                  </div>

                  {(!todaySession.session_exercises || todaySession.session_exercises.length === 0) ? (
                    <div className="card text-center" style={{ padding: 'var(--space-8) var(--space-4)', background: 'var(--surface-container-low)', border: '1px solid rgba(var(--error), 0.2)', borderRadius: 'var(--radius-xl)' }}>
                      <div style={{ backgroundColor: 'rgba(var(--error), 0.1)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                        <RefreshCw size={24} style={{ color: 'var(--error)' }} />
                      </div>
                      <h3 className="title-md mb-2" style={{ color: 'var(--on-surface)' }}>Programme à mettre à jour</h3>
                      <p className="body-sm mb-6" style={{ color: 'var(--on-surface-variant)', maxWidth: '280px', margin: '0 auto var(--space-6)' }}>
                        Les données de ton programme Street Workout doivent être recalculées pour correspondre à la nouvelle base d'exercices.
                      </p>
                      <button className="btn btn--primary" onClick={handleRegenerate} disabled={regenerating} style={{ padding: 'var(--space-3) var(--space-6)' }}>
                        {regenerating ? 'Initialisation...' : 'Mettre à jour mon programme'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {(todaySession.session_exercises || []).map((se, i) => (
                        <div key={se.id} style={{ 
                          background: 'var(--surface-container)', 
                          border: '1px solid rgba(var(--outline-variant), 0.1)',
                          borderRadius: 'var(--radius-lg)',
                          overflow: 'hidden'
                        }}>
                          <div className="flex" style={{ height: '80px' }}>
                            <div style={{ width: '80px', flexShrink: 0, backgroundImage: `url(${getExerciseImage(se.exercises?.nom)})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRight: '1px solid rgba(var(--outline-variant), 0.1)' }} />
                            <div className="flex items-center justify-between" style={{ padding: 'var(--space-4)', flex: 1 }}>
                              <div>
                                <p className="title-md" style={{ textTransform: 'uppercase', margin: 0 }}>{se.exercises?.nom}</p>
                                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>{se.series} × {se.reps_min}-{se.reps_max} · {se.repos_secondes || 90}S REPOS</p>
                              </div>
                              <button onClick={() => handleReplaceClick(se)} className="btn btn--sm" style={{ padding: '8px', backgroundColor: 'var(--surface-container-high)', border: '1px solid rgba(var(--outline-variant), 0.2)', color: 'var(--on-surface)', borderRadius: 'var(--radius-md)' }}>
                                <Repeat size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!todaySession.session_exercises || todaySession.session_exercises.length === 0) ? null : (
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
                      <button className="btn btn--primary btn--full" style={{ flex: 3, padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }} onClick={startWorkout}>
                        <Play size={20} /> Démarrer la séance
                      </button>
                      <button onClick={() => setShowRoulette(true)} style={{ flex: 1, padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Exercice Surprise">
                        <Dice5 size={22} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div variants={item} className="card" style={{ textAlign: 'center', padding: 'var(--space-10)', background: 'var(--surface-container-low)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                <p className="title-lg text-muted" style={{ textTransform: 'uppercase' }}>Jour de repos</p>
                <p className="body-md text-muted" style={{ marginBottom: 'var(--space-6)' }}>Récupération musculaire en cours.</p>
                <button onClick={() => setShowRoulette(true)} style={{ background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', border: 'none', color: '#fff', padding: '14px 28px', borderRadius: 999, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Dice5 size={18} /> Exercice Surprise
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Replace Exercise Modal */}
      {replaceModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div className="card" style={{ width: '100%', maxWidth: 450, maxHeight: '80vh', overflowY: 'auto', background: 'var(--surface)', border: '1px solid rgba(var(--outline-variant), 0.2)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="display-sm" style={{ textTransform: 'uppercase', margin: 0, lineHeight: 1 }}>Remplacer</h3>
              <button onClick={() => setReplaceModal({ open: false, sessionExercise: null, alternatives: [], loading: false })} style={{ background: 'var(--surface-container-high)', border: 'none', color: 'var(--on-surface)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ background: 'var(--surface-container)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--secondary)' }}>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Exercice actuel</p>
              <strong className="title-md" style={{ color: 'var(--on-surface)' }}>{replaceModal.sessionExercise?.exercises?.nom}</strong>
            </div>

            {replaceModal.loading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto var(--space-4)', width: '32px', height: '32px', border: '3px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p className="label-sm text-muted">RECHERCHE D'ALTERNATIVES...</p>
              </div>
            ) : replaceModal.alternatives.length === 0 ? (
              <p className="body-md text-center" style={{ color: 'var(--on-surface-variant)', padding: 'var(--space-8) 0' }}>Aucune alternative trouvée pour ce groupe musculaire.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', fontWeight: 'bold' }}>Sélectionnez un remplacement</p>
                {replaceModal.alternatives.map(alt => (
                  <button key={alt.id} onClick={() => confirmReplace(alt.id)} className="card" style={{ 
                    padding: 'var(--space-4)', background: 'var(--surface-container-low)', border: '1px solid rgba(var(--outline-variant), 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-container)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(var(--outline-variant), 0.1)'; e.currentTarget.style.background = 'var(--surface-container-low)'; }}>
                    <div>
                      <p className="title-md" style={{ textTransform: 'uppercase', color: 'var(--on-surface)', margin: 0 }}>{alt.nom}</p>
                      <p className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{alt.muscles_principaux?.join(', ').toUpperCase()}</p>
                    </div>
                    <ChevronRight size={20} style={{ color: 'var(--primary)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Roulette Overlay */}
      <AnimatePresence>
        {showRoulette && (
          <ExerciseRoulette
            exercises={allExercises}
            profile={profile}
            onClose={() => setShowRoulette(false)}
            onStart={(ex) => { setShowRoulette(false); }}
          />
        )}
      </AnimatePresence>

      {/* Regenerate button */}
      {program && (
        <motion.div variants={item} style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <button onClick={handleRegenerate} disabled={regenerating} style={{
            width: '100%', background: 'var(--surface-container-high)', border: '1px solid rgba(var(--outline-variant), 0.2)',
            color: 'var(--on-surface-variant)', padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem',
          }}>
            <RefreshCw size={16} /> {regenerating ? 'Régénération...' : 'Changer de programme'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
