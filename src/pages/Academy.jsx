import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STREET_WORKOUT_SKILLS } from '../data/streetWorkoutSkills';
import { GYM_SKILLS } from '../data/gymSkills';
import { Trophy, Clock, CheckCircle2, ChevronDown, ChevronUp, Lock, Dumbbell, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { addXP } from '../utils/gamification';

export default function Academy() {
  const { profile, user } = useAuth();
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [loadingSkill, setLoadingSkill] = useState(null);
  const [justValidated, setJustValidated] = useState(null);

  // Vraie logique de déblocage
  const achievedSkills = profile?.unlocked_skills || [];
  
  const mode = profile?.mode_entrainement || 'salle';
  let displayedSkills = [];
  let pageTitle = 'Académie';
  let pageDesc = 'Débloque de nouveaux paliers.';

  if (mode === 'street_workout') {
    displayedSkills = STREET_WORKOUT_SKILLS;
    pageTitle = 'Académie Street Workout';
    pageDesc = 'Maîtrise les skills au poids du corps et débloque de nouvelles figures.';
  } else if (mode === 'salle') {
    displayedSkills = GYM_SKILLS;
    pageTitle = 'Paliers de Force';
    pageDesc = 'Atteins tes objectifs de force pure en salle de sport.';
  } else {
    // Mixte
    displayedSkills = [...GYM_SKILLS, ...STREET_WORKOUT_SKILLS];
    pageTitle = 'Académie Mixte';
    pageDesc = 'Paliers de force et figures au poids du corps.';
  }

  // Calcul du palier max atteint pour définir ce qui est déblocable
  const achievedSkillObjects = displayedSkills.filter(s => achievedSkills.includes(s.id));
  const maxDifficultyAchieved = achievedSkillObjects.length > 0 ? Math.max(...achievedSkillObjects.map(s => s.difficulty)) : 0;

  const isAchieved = (skillId) => achievedSkills.includes(skillId);
  // On peut s'entraîner/valider un palier si sa difficulté est au plus (max_atteint + 1)
  const isUnlockable = (difficulty) => difficulty <= maxDifficultyAchieved + 1 || difficulty === 1;

  async function validateSkill(e, skill) {
    e.stopPropagation();
    if (loadingSkill) return;
    setLoadingSkill(skill.id);
    
    try {
      // 1. Ajouter à unlocked_skills
      const newUnlockedSkills = [...achievedSkills, skill.id];
      const { error } = await supabase.from('profiles').update({ unlocked_skills: newUnlockedSkills }).eq('id', user.id);
      
      if (error) throw error;

      // 2. Ajouter XP (Gros gain pour un palier)
      await addXP(user.id, 500);
      
      // Update local profile ref if possible, otherwise rely on a page refresh or context update
      // For now, it will update when context refreshes, but we can visually show it:
      profile.unlocked_skills = newUnlockedSkills; 
      
      setJustValidated(skill.id);
      setTimeout(() => setJustValidated(null), 3000);

    } catch (err) {
      console.error(err);
      alert('Erreur lors de la validation du palier.');
    } finally {
      setLoadingSkill(null);
    }
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-10)', marginTop: 'var(--space-4)' }}>
          <div>
            <h1 className="display-sm" style={{ textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
              KINETIC<br />
              <span style={{ color: 'var(--primary)' }}>{mode === 'street_workout' ? 'ACADEMY' : 'STRENGTH'}</span>
            </h1>
          </div>
          <div style={{ marginBottom: '4px', background: 'var(--surface-container-high)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-md" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Paliers débloqués : {achievedSkills.length}
            </span>
          </div>
        </motion.div>

        <motion.p variants={item} className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-8)' }}>{pageDesc}</motion.p>

        {displayedSkills.map((skill) => {
          const achieved = isAchieved(skill.id);
          const unlockable = isUnlockable(skill.difficulty);
          const isExpanded = expandedSkill === skill.id;
          
          let prereqText = skill.prereq;
          if (skill.multiplier && profile?.poids_kg) {
            const targetWeight = Math.round(skill.multiplier * profile.poids_kg);
            prereqText = `${targetWeight} kg (${skill.multiplier}x PDC)`;
          }
          
          return (
            <motion.div variants={item} key={skill.id} className="card" 
              style={{ 
                marginBottom: 'var(--space-4)', 
                background: achieved ? 'var(--surface-container)' : unlockable ? 'var(--surface-container-low)' : 'var(--surface)', 
                border: achieved ? '1px solid rgba(var(--primary-rgb), 0.3)' : '1px solid rgba(var(--outline-variant), 0.1)',
                opacity: unlockable ? 1 : 0.5,
                borderRadius: 'var(--radius-xl)',
                cursor: unlockable ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} 
              onClick={() => unlockable && setExpandedSkill(isExpanded ? null : skill.id)}>
              <div className="flex items-center justify-between" style={{ padding: 'var(--space-4)' }}>
                <div className="flex items-center gap-4">
                  {!unlockable ? (
                    <div style={{ padding: '12px', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-xl)' }}>
                      <Lock size={24} style={{ color: 'var(--on-surface-variant)' }} />
                    </div>
                  ) : achieved ? (
                    <div style={{ padding: '12px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: 'var(--radius-xl)', boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.2)' }}>
                      <CheckCircle2 size={24} style={{ color: 'var(--primary)' }} />
                    </div>
                  ) : (
                    <div style={{ padding: '12px', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-xl)' }}>
                      <Trophy size={24} style={{ color: 'var(--on-surface-variant)' }} />
                    </div>
                  )}
                  <div>
                    <h3 className="title-lg" style={{ textTransform: 'uppercase', color: achieved ? 'var(--primary)' : 'var(--on-surface)', margin: 0, textDecoration: achieved ? 'line-through' : 'none' }}>{skill.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>DIFF: {skill.difficulty}/6</span>
                      <span style={{ color: 'var(--outline-variant)' }}>•</span>
                      <span className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>{skill.type}</span>
                    </div>
                  </div>
                </div>
                {unlockable && (
                  isExpanded ? <ChevronUp style={{ color: 'var(--on-surface-variant)' }} /> : <ChevronDown style={{ color: 'var(--on-surface-variant)' }} />
                )}
              </div>
              
              <AnimatePresence>
                {isExpanded && unlockable && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
                      <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                        {skill.image && (
                          <div style={{ marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '140px', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                            <img src={skill.image} alt={skill.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div className="flex gap-4 mb-4">
                          <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                            <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Objectif</span>
                            <span className="title-md" style={{ color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)' }} /> {prereqText}</span>
                          </div>
                          <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                            <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Temps Est.</span>
                            <span className="title-md" style={{ color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} style={{ color: 'var(--secondary)' }} /> {skill.time}</span>
                          </div>
                        </div>
                        <div style={{ background: 'var(--surface-container-highest)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                          <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Focus Musculaire</span>
                          <p className="body-md" style={{ color: 'var(--on-surface)' }}>{skill.focus}</p>
                        </div>

                        {!achieved && (
                          <button 
                            className="btn btn--primary btn--full" 
                            style={{ padding: '16px', borderRadius: 'var(--radius-xl)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}
                            onClick={(e) => validateSkill(e, skill)}
                            disabled={loadingSkill === skill.id}
                          >
                            {loadingSkill === skill.id ? 'Validation...' : 'Marquer comme réussi (+500 XP)'}
                          </button>
                        )}
                        
                        {justValidated === skill.id && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-center gap-2 text-primary" style={{ padding: '12px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: 'var(--radius-lg)' }}>
                            <Zap size={20} /> <span className="title-md">Palier débloqué ! +500 XP</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
