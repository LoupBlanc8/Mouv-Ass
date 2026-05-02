import { supabase } from '../lib/supabase';

// Niveaux d'XP et Ligues
const RANKS = [
  { name: 'Recrue', minXP: 0 },
  { name: 'Bronze', minXP: 500 },
  { name: 'Argent', minXP: 2000 },
  { name: 'Or', minXP: 5000 },
  { name: 'Platine', minXP: 10000 },
  { name: 'Spartiate', minXP: 20000 },
  { name: 'Légende', minXP: 50000 },
];

/**
 * Ajoute de l'XP à un utilisateur et met à jour son rang
 * @param {string} userId 
 * @param {number} amount 
 * @returns {Promise<{success: boolean, xpAdded: number, newXP: number, newRank: string, levelUp: boolean}>}
 */
export async function addXP(userId, amount) {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, rank')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentXP = profile.xp || 0;
    const newXP = currentXP + amount;

    let newRank = 'Recrue';
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (newXP >= RANKS[i].minXP) {
        newRank = RANKS[i].name;
        break;
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXP, rank: newRank })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return { success: true, xpAdded: amount, newXP, newRank, levelUp: newRank !== profile.rank };
  } catch (error) {
    console.error('Error adding XP:', error);
    return { success: false, error };
  }
}

/**
 * Calcule l'XP à attribuer en fin de séance
 * Règle : minimum 3 exercices, XP proportionnelle au volume
 */
export function calculateSessionXP(logs) {
  if (!logs || logs.length === 0) return 0;
  
  // Compter les exercices uniques
  const uniqueExercises = new Set(logs.map(l => l.exercise_id)).size;
  
  // Minimum 3 exercices pour gagner de l'XP
  if (uniqueExercises < 3) return 0;
  
  // XP de base (50) + bonus par exercice (20) + bonus volume
  const baseXP = 50;
  const exerciseBonus = uniqueExercises * 20;
  const totalVolume = logs.reduce((sum, l) => sum + ((l.poids_kg || 0) * (l.reps || 0)), 0);
  const volumeBonus = Math.min(100, Math.floor(totalVolume / 500) * 10); // Max 100 XP bonus
  
  return baseXP + exerciseBonus + volumeBonus;
}

/**
 * Met à jour le streak de l'utilisateur
 */
export async function updateStreak(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('streak_current, streak_record, last_workout_date')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = profile.last_workout_date;

    // Déjà enregistré aujourd'hui
    if (lastDate === today) return { streak: profile.streak_current, isNew: false };

    let newStreak = 1;
    if (lastDate === yesterday) {
      // Jour consécutif
      newStreak = (profile.streak_current || 0) + 1;
    }
    // Sinon reset à 1

    const newRecord = Math.max(newStreak, profile.streak_record || 0);

    await supabase
      .from('profiles')
      .update({ streak_current: newStreak, streak_record: newRecord, last_workout_date: today })
      .eq('user_id', userId);

    return { streak: newStreak, record: newRecord, isNew: newStreak > (profile.streak_record || 0) };
  } catch (err) {
    console.error('Streak update error:', err);
    return { streak: 0, isNew: false };
  }
}

export function getRankProgress(currentXP) {
  let currentRankIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (currentXP >= RANKS[i].minXP) {
      currentRankIdx = i;
      break;
    }
  }

  const currentRank = RANKS[currentRankIdx];
  const nextRank = currentRankIdx < RANKS.length - 1 ? RANKS[currentRankIdx + 1] : null;

  if (!nextRank) {
    return { currentRank: currentRank.name, progress: 100, xpToNext: 0 };
  }

  const xpIntoRank = currentXP - currentRank.minXP;
  const rankSize = nextRank.minXP - currentRank.minXP;
  const progress = Math.min(100, Math.max(0, (xpIntoRank / rankSize) * 100));

  return {
    currentRank: currentRank.name,
    nextRank: nextRank.name,
    progress,
    xpToNext: nextRank.minXP - currentXP
  };
}
