import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Check, ChevronRight, Timer, Dumbbell, ChevronDown } from 'lucide-react';

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
  }

  function logSet() {
    if (!weight || !reps) return;
    const ex = activeWorkout.session_exercises[currentExIdx];
    const log = { exercise_id: ex.exercise_id, serie: currentSet, poids_kg: parseFloat(weight), reps: parseInt(reps), session_id: activeWorkout.id };
    setLogs(prev => [...prev, log]);

    if (currentSet < ex.series) {
      setCurrentSet(prev => prev + 1);
      startRest(ex.repos_secondes);
    } else if (currentExIdx < activeWorkout.session_exercises.length - 1) {
      setCurrentExIdx(prev => prev + 1);
      setCurrentSet(1);
      setWeight('');
      setReps('');
      startRest(ex.repos_secondes + 30);
    } else {
      finishWorkout();
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

  async function finishWorkout() {
    setActiveWorkout(null);
    if (logs.length > 0) {
      const toInsert = logs.map(l => ({ ...l, user_id: user.id, date: new Date().toISOString().split('T')[0] }));
      await supabase.from('workout_logs').insert(toInsert);
    }
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  // Active workout view
  if (activeWorkout) {
    const ex = activeWorkout.session_exercises[currentExIdx];
    const exercise = ex?.exercises;
    return (
      <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="label-sm text-primary">{activeWorkout.nom}</p>
            <h2 className="title-lg">Exercice {currentExIdx + 1}/{activeWorkout.session_exercises.length}</h2>
          </div>
          <button className="btn btn--secondary btn--sm" onClick={finishWorkout}>Terminer</button>
        </div>

        <motion.div key={currentExIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card card--glow-primary mb-6">
          <h3 className="headline-sm mb-2">{exercise?.nom}</h3>
          <p className="body-sm text-muted mb-4">{exercise?.description_technique}</p>
          <div className="flex gap-4 mb-4">
            <div><span className="label-sm text-muted">Séries</span><div className="title-md text-primary">{ex.series}</div></div>
            <div><span className="label-sm text-muted">Reps</span><div className="title-md">{ex.reps_min}-{ex.reps_max}</div></div>
            <div><span className="label-sm text-muted">Repos</span><div className="title-md">{ex.repos_secondes}s</div></div>
            <div><span className="label-sm text-muted">Tempo</span><div className="title-md">{ex.tempo}</div></div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isResting && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="card card--glass mb-6" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <Timer size={28} className="text-primary" style={{ marginBottom: 'var(--space-3)' }} />
              <div className="display-md text-primary">{Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}</div>
              <p className="body-sm text-muted mb-4">Repos</p>
              <button className="btn btn--secondary btn--sm" onClick={skipRest}>Passer <ChevronRight size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {!isResting && (
          <div className="card mb-6">
            <p className="label-md text-primary mb-4">Série {currentSet} / {ex.series}</p>
            <div className="flex gap-4 mb-4">
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Poids (kg)</label>
                <input className="input" type="number" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" />
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="input-label">Reps</label>
                <input className="input" type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="0" />
              </div>
            </div>
            <button className="btn btn--primary btn--full" onClick={logSet} disabled={!weight || !reps}>
              <Check size={18} /> Valider la série
            </button>
          </div>
        )}

        {/* Logged sets */}
        {logs.filter(l => l.exercise_id === ex.exercise_id).length > 0 && (
          <div className="card card--recessed">
            <p className="label-sm text-muted mb-3">Séries validées</p>
            {logs.filter(l => l.exercise_id === ex.exercise_id).map((l, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: 'var(--space-2) 0', borderBottom: i < logs.filter(x => x.exercise_id === ex.exercise_id).length - 1 ? '1px solid var(--surface-container-highest)' : 'none' }}>
                <span className="body-sm">Série {l.serie}</span>
                <span className="body-md" style={{ fontWeight: 600 }}>{l.poids_kg}kg × {l.reps}</span>
              </div>
            ))}
          </div>
        )}
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
