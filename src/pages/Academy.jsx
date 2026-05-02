import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STREET_WORKOUT_SKILLS } from '../data/streetWorkoutSkills';
import { GYM_SKILLS } from '../data/gymSkills';
import { Trophy, Clock, CheckCircle2, ChevronDown, ChevronUp, Lock, Dumbbell, Zap, Target, Swords } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { addXP } from '../utils/gamification';
import DailyQuests from '../components/ui/DailyQuests';

const TABS = [
  { id: 'paliers', label: 'Paliers', icon: '🏆' },
  { id: 'quetes', label: 'Quêtes', icon: '⚔️' },
];

// No longer a static constant


export default function Academy() {
  const { profile, user, updateProfile, refreshProfile } = useAuth();
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [loadingSkill, setLoadingSkill] = useState(null);
  const [justValidated, setJustValidated] = useState(null);
  const [activeTab, setActiveTab] = useState('paliers');
  const [muscleFilter, setMuscleFilter] = useState('Tous');

  const mode = profile?.mode_entrainement || 'salle';
  const achievedSkills = profile?.unlocked_skills || [];

  // Reset filter when mode changes to avoid empty views
  useEffect(() => {
    setMuscleFilter('Tous');
  }, [mode]);



  const muscleFilters = mode === 'street_workout' 
    ? ['Tous', 'Push', 'Pull', 'Core']
    : ['Tous', 'Pectoraux', 'Dos', 'Épaules', 'Jambes'];


  let displayedSkills = [];
  if (mode === 'street_workout') {
    displayedSkills = STREET_WORKOUT_SKILLS;
  } else if (mode === 'salle') {
    displayedSkills = GYM_SKILLS;
  } else {
    displayedSkills = [...GYM_SKILLS, ...STREET_WORKOUT_SKILLS];
  }

  // Filter by muscle group
  const filteredSkills = muscleFilter === 'Tous'
    ? displayedSkills
    : displayedSkills.filter(s => s.focus?.toLowerCase().includes(muscleFilter.toLowerCase()));

  const availableDifficulties = [...new Set(displayedSkills.map(s => s.difficulty))].sort((a, b) => a - b);
  const achievedSkillObjects = displayedSkills.filter(s => achievedSkills.includes(s.id));
  const maxDifficultyAchieved = achievedSkillObjects.length > 0 ? Math.max(...achievedSkillObjects.map(s => s.difficulty)) : 0;
  const currentDiffIndex = availableDifficulties.indexOf(maxDifficultyAchieved);
  const nextUnlockableDifficulty = currentDiffIndex >= 0 && currentDiffIndex < availableDifficulties.length - 1
    ? availableDifficulties[currentDiffIndex + 1]
    : availableDifficulties[0];

  const isAchieved = (skillId) => achievedSkills.includes(skillId);
  const isUnlockable = (difficulty) => difficulty <= maxDifficultyAchieved || difficulty === nextUnlockableDifficulty;

  async function validateSkill(e, skill) {
    e.stopPropagation();
    if (loadingSkill) return;
    setLoadingSkill(skill.id);
    try {
      const newUnlockedSkills = [...achievedSkills, skill.id];
      await updateProfile({ unlocked_skills: newUnlockedSkills });
      await addXP(user.id, 500);
      await refreshProfile();
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
        {/* Header */}
        <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
          <h1 className="display-sm" style={{ textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
            MOUV'BODY<br />
            <span style={{ color: 'var(--primary)' }}>ACADEMY</span>
          </h1>
          <div style={{ marginBottom: '4px', background: 'var(--surface-container-high)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <span className="label-md" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {achievedSkills.length} débloqués
            </span>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <motion.div variants={item} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '12px', borderRadius: 'var(--radius-xl)', border: 'none',
              background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-container-high)',
              color: activeTab === tab.id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Quests Tab */}
        {activeTab === 'quetes' && (
          <motion.div variants={item}>
            <DailyQuests />
          </motion.div>
        )}

        {/* Paliers Tab */}
        {activeTab === 'paliers' && (
          <>
            {/* Muscle filter */}
            <motion.div variants={item} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-1)' }}>
              {muscleFilters.map(filter => (

                <button key={filter} onClick={() => setMuscleFilter(filter)} style={{
                  padding: '8px 16px', borderRadius: 999, border: 'none', flexShrink: 0,
                  background: muscleFilter === filter ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--surface-container)',
                  color: muscleFilter === filter ? 'var(--primary)' : 'var(--on-surface-variant)',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase',
                  border: muscleFilter === filter ? '1px solid rgba(var(--primary-rgb), 0.3)' : '1px solid rgba(var(--outline-variant), 0.1)',
                }}>
                  {filter}
                </button>
              ))}
            </motion.div>

            {filteredSkills.map(skill => {
              const achieved = isAchieved(skill.id);
              const unlockable = isUnlockable(skill.difficulty);
              const isExpanded = expandedSkill === skill.id;
              let prereqText = skill.prereq;
              if (skill.multiplier && profile?.poids_kg) {
                prereqText = `${Math.round(skill.multiplier * profile.poids_kg)} kg (${skill.multiplier}x PDC)`;
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
                        <div style={{ padding: '12px', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-xl)' }}><Lock size={24} style={{ color: 'var(--on-surface-variant)' }} /></div>
                      ) : achieved ? (
                        <div style={{ padding: '12px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: 'var(--radius-xl)', boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.2)' }}><CheckCircle2 size={24} style={{ color: 'var(--primary)' }} /></div>
                      ) : (
                        <div style={{ padding: '12px', background: 'var(--surface-container-high)', borderRadius: 'var(--radius-xl)' }}><Trophy size={24} style={{ color: 'var(--on-surface-variant)' }} /></div>
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
                    {unlockable && (isExpanded ? <ChevronUp style={{ color: 'var(--on-surface-variant)' }} /> : <ChevronDown style={{ color: 'var(--on-surface-variant)' }} />)}
                  </div>

                  <AnimatePresence>
                    {isExpanded && unlockable && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                          <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                            {skill.image && (
                              <div style={{ marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '140px', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
                                <img src={skill.image} alt={skill.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <div className="flex gap-4 mb-4">
                              <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                                <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Objectif</span>
                                <span className="title-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} style={{ color: 'var(--primary)' }} /> {prereqText}</span>
                              </div>
                              <div style={{ flex: 1, background: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                                <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Temps Est.</span>
                                <span className="title-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} style={{ color: 'var(--secondary)' }} /> {skill.time}</span>
                              </div>
                            </div>
                            <div style={{ background: 'var(--surface-container-highest)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                              <span className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Focus Musculaire</span>
                              <p className="body-md">{skill.focus}</p>
                            </div>
                            {!achieved && (
                              <button className="btn btn--primary btn--full" style={{ padding: '16px', borderRadius: 'var(--radius-xl)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}
                                onClick={(e) => validateSkill(e, skill)} disabled={loadingSkill === skill.id}>
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

            {filteredSkills.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--on-surface-variant)' }}>
                <p className="title-md">Aucun palier pour ce filtre</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
