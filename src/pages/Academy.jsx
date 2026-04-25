import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STREET_WORKOUT_SKILLS } from '../data/streetWorkoutSkills';
import { GYM_SKILLS } from '../data/gymSkills';
import { Trophy, Clock, CheckCircle2, ChevronDown, ChevronUp, Lock, Dumbbell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Academy() {
  const { profile } = useAuth();
  const [expandedSkill, setExpandedSkill] = useState(null);
  
  // Fake unlocked logic based on level/xp for now
  const isUnlocked = (difficulty) => {
    if (!profile) return false;
    const userLevel = profile.niveau === 'avance' ? 3 : profile.niveau === 'intermediaire' ? 2 : 1;
    if (userLevel === 3) return true;
    if (userLevel === 2 && difficulty <= 4) return true;
    if (userLevel === 1 && difficulty <= 2) return true;
    return false;
  };

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  const mode = profile?.mode_entrainement || 'salle';
  
  // Determine which skills to show based on user profile
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

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="flex items-center gap-3">
            {mode === 'street_workout' ? <Trophy className="text-primary" size={28} /> : <Dumbbell className="text-primary" size={28} />}
            <h1 className="headline-md">{pageTitle}</h1>
          </div>
          <p className="body-md text-muted mt-2">{pageDesc}</p>
        </motion.div>

        {displayedSkills.map((skill) => {
          const unlocked = isUnlocked(skill.difficulty);
          const isExpanded = expandedSkill === skill.id;
          
          // Calculate dynamic weight if applicable
          let prereqText = skill.prereq;
          if (skill.multiplier && profile?.poids_kg) {
            const targetWeight = Math.round(skill.multiplier * profile.poids_kg);
            prereqText = `${targetWeight} kg (${skill.multiplier}x PDC)`;
          }
          
          return (
            <motion.div variants={item} key={skill.id} className={`card mb-4 ${unlocked ? 'card--interactive card--glow-primary' : 'card--recessed'}`} onClick={() => unlocked && setExpandedSkill(isExpanded ? null : skill.id)}>
              <div className="flex items-center justify-between" style={{ padding: 'var(--space-2) 0' }}>
                <div className="flex items-center gap-3">
                  {!unlocked ? (
                    <div style={{ padding: '8px', background: 'var(--surface-container-highest)', borderRadius: 'var(--radius-full)' }}>
                      <Lock size={20} className="text-muted" />
                    </div>
                  ) : (
                    <div style={{ padding: '8px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: 'var(--radius-full)' }}>
                      <Trophy size={20} className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="title-md" style={{ color: unlocked ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>{skill.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`chip chip--sm ${unlocked ? 'chip--secondary' : ''}`} style={{ opacity: unlocked ? 1 : 0.5 }}>Diff: {skill.difficulty}/6</span>
                      <span className="body-sm text-muted">{skill.type}</span>
                    </div>
                  </div>
                </div>
                {unlocked && (
                  isExpanded ? <ChevronUp className="text-muted" /> : <ChevronDown className="text-muted" />
                )}
              </div>
              
              <AnimatePresence>
                {isExpanded && unlocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--surface-container-highest)' }}>
                      <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                          <span className="label-sm text-muted mb-1 block">Objectif Requis</span>
                          <span className="body-sm text-on-surface flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /> {prereqText}</span>
                        </div>
                        <div className="flex-1">
                          <span className="label-sm text-muted mb-1 block">Temps d'entraînement</span>
                          <span className="body-sm text-on-surface flex items-center gap-2"><Clock size={14} className="text-warning" /> {skill.time}</span>
                        </div>
                      </div>
                      <div className="card card--glass" style={{ padding: 'var(--space-3)' }}>
                        <span className="label-sm text-muted block mb-1">Focus Musculaire</span>
                        <p className="body-sm">{skill.focus}</p>
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
